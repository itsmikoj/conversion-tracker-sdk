import { Event, EventPriority } from '../models/Event';
import { StorageService } from '../services/StorageService';
import { Logger } from '../utils/Logger';

export class EventQueue {
  private queue: Event[] = [];
  private maxSize: number;
  private storage: StorageService;
  private logger: Logger;
  private persistenceKey = 'event_queue';
  private dlqKey = 'dead_letter_queue';

  constructor(maxSize: number, storage: StorageService, logger: Logger) {
    this.maxSize = maxSize;
    this.storage = storage;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    await this.loadPersistedEvents();
  }

  async enqueue(event: Event): Promise<void> {
    if (this.queue.length >= this.maxSize) {
      this.logger.warn('Queue is full, removing oldest low-priority event');
      this.removeLowestPriorityEvent();
    }

    this.queue.push(event);
    this.sortByPriority();
    await this.persist();

    this.logger.debug(`Event enqueued: ${event.type}`, event);
  }

  async enqueueBatch(events: Event[]): Promise<void> {
    for (const event of events) {
      await this.enqueue(event);
    }
  }

  dequeue(count: number = 1): Event[] {
    const events = this.queue.splice(0, count);
    this.persist();
    return events;
  }

  peek(count: number = 1): Event[] {
    return this.queue.slice(0, count);
  }

  async requeue(event: Event): Promise<void> {
    event.retryCount++;
    
    if (event.retryCount >= event.maxRetries) {
      this.logger.error(`Event max retries reached: ${event.type}`, event);
      await this.moveToDeadLetterQueue(event);
      return;
    }

    const backoffDelay = Math.pow(2, event.retryCount) * 1000;
    event.metadata.timestamp = Date.now() + backoffDelay;

    await this.enqueue(event);
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }

  getEvents(): Event[] {
    return [...this.queue];
  }

  getEventsByType(type: string): Event[] {
    return this.queue.filter(e => e.type === type);
  }

  getEventsByPriority(priority: EventPriority): Event[] {
    return this.queue.filter(e => e.priority === priority);
  }

  async removeEvent(eventId: string): Promise<boolean> {
    const index = this.queue.findIndex(e => e.id === eventId);
    if (index > -1) {
      this.queue.splice(index, 1);
      await this.persist();
      return true;
    }
    return false;
  }

  async getDeadLetterQueue(): Promise<Event[]> {
    try {
      const data = await this.storage.getItem(this.dlqKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      this.logger.error('Failed to get DLQ', error);
      return [];
    }
  }

  async clearDeadLetterQueue(): Promise<void> {
    try {
      await this.storage.removeItem(this.dlqKey);
      this.logger.info('Dead letter queue cleared');
    } catch (error) {
      this.logger.error('Failed to clear DLQ', error);
    }
  }

  private sortByPriority(): void {
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt - b.createdAt;
    });
  }

  private removeLowestPriorityEvent(): void {
    let lowestPriorityIndex = 0;
    let lowestPriority = this.queue[0]?.priority ?? EventPriority.HIGH;

    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority < lowestPriority) {
        lowestPriority = this.queue[i].priority;
        lowestPriorityIndex = i;
      }
    }

    const removed = this.queue.splice(lowestPriorityIndex, 1);
    this.logger.warn(`Removed low-priority event due to queue full: ${removed[0]?.type}`);
  }

  private async persist(): Promise<void> {
    try {
      await this.storage.setItem(this.persistenceKey, JSON.stringify(this.queue));
    } catch (error) {
      this.logger.error('Failed to persist queue', error);
    }
  }

  private async loadPersistedEvents(): Promise<void> {
    try {
      const data = await this.storage.getItem(this.persistenceKey);
      if (data) {
        this.queue = JSON.parse(data);
        this.sortByPriority();
        this.logger.info(`Loaded ${this.queue.length} persisted events`);
      }
    } catch (error) {
      this.logger.error('Failed to load persisted events', error);
      this.queue = [];
    }
  }

  private async moveToDeadLetterQueue(event: Event): Promise<void> {
    try {
      const existingData = await this.storage.getItem(this.dlqKey);
      const dlq: Event[] = existingData ? JSON.parse(existingData) : [];
      
      dlq.push({
        ...event,
        sentAt: Date.now(),
      });
      
      if (dlq.length > 100) {
        dlq.splice(0, dlq.length - 100);
      }
      
      await this.storage.setItem(this.dlqKey, JSON.stringify(dlq));
      this.logger.warn('Event moved to DLQ', { type: event.type, id: event.id });
    } catch (error) {
      this.logger.error('Failed to move event to DLQ', error);
    }
  }
}
