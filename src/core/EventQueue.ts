import { Event, EventPriority } from '../models/Event';
import { StorageService } from '../services/StorageService';
import { Logger } from '../utils/Logger';

export class EventQueue {
  private queue: Event[] = [];
  private processing = false;
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

  /**
   * Initialize and load persisted events
   */
  async initialize(): Promise<void> {
    await this.loadPersistedEvents();
  }

  /**
   * Add event to queue
   */
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

  /**
   * Add multiple events to queue
   */
  async enqueueBatch(events: Event[]): Promise<void> {
    for (const event of events) {
      await this.enqueue(event);
    }
  }

  /**
   * Remove and return events from queue
   */
  dequeue(count: number = 1): Event[] {
    const events = this.queue.splice(0, count);
    this.persist();
    return events;
  }

  /**
   * View events without removing them
   */
  peek(count: number = 1): Event[] {
    return this.queue.slice(0, count);
  }

  /**
   * Re-add failed event to queue with retry logic
   */
  async requeue(event: Event): Promise<void> {
    event.retryCount++;
    
    if (event.retryCount >= event.maxRetries) {
      this.logger.error(`Event max retries reached: ${event.type}`, event);
      await this.moveToDeadLetterQueue(event);
      return;
    }

    // Add exponential backoff by updating timestamp
    const backoffDelay = Math.pow(2, event.retryCount) * 1000;
    event.metadata.timestamp = Date.now() + backoffDelay;

    await this.enqueue(event);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Clear all events from queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.persist();
  }

  /**
   * Get all events (copy)
   */
  getEvents(): Event[] {
    return [...this.queue];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): Event[] {
    return this.queue.filter(e => e.type === type);
  }

  /**
   * Get events by priority
   */
  getEventsByPriority(priority: EventPriority): Event[] {
    return this.queue.filter(e => e.priority === priority);
  }

  /**
   * Remove specific event by ID
   */
  async removeEvent(eventId: string): Promise<boolean> {
    const index = this.queue.findIndex(e => e.id === eventId);
    if (index > -1) {
      this.queue.splice(index, 1);
      await this.persist();
      return true;
    }
    return false;
  }

  /**
   * Get dead letter queue events
   */
  async getDeadLetterQueue(): Promise<Event[]> {
    try {
      const data = await this.storage.getItem(this.dlqKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      this.logger.error('Failed to get DLQ', error);
      return [];
    }
  }

  /**
   * Clear dead letter queue
   */
  async clearDeadLetterQueue(): Promise<void> {
    try {
      await this.storage.removeItem(this.dlqKey);
      this.logger.info('Dead letter queue cleared');
    } catch (error) {
      this.logger.error('Failed to clear DLQ', error);
    }
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortByPriority(): void {
    this.queue.sort((a, b) => {
      // First by priority (higher first)
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // Then by timestamp (older first)
      return a.createdAt - b.createdAt;
    });
  }

  /**
   * Remove lowest priority event to make space
   */
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

  /**
   * Persist queue to storage
   */
  private async persist(): Promise<void> {
    try {
      await this.storage.setItem(this.persistenceKey, JSON.stringify(this.queue));
    } catch (error) {
      this.logger.error('Failed to persist queue', error);
    }
  }

  /**
   * Load persisted events from storage
   */
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

  /**
   * Move failed event to dead letter queue
   */
  private async moveToDeadLetterQueue(event: Event): Promise<void> {
    try {
      const existingData = await this.storage.getItem(this.dlqKey);
      const dlq: Event[] = existingData ? JSON.parse(existingData) : [];
      
      dlq.push({
        ...event,
        sentAt: Date.now(),
      });
      
      // Keep only last 100 failed events
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
