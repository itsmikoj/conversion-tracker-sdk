import { Event, EventPriority } from '../models/Event';
import { StorageService } from '../services/StorageService';
import { Logger } from '../utils/Logger';
export declare class EventQueue {
    private queue;
    private maxSize;
    private storage;
    private logger;
    private persistenceKey;
    private dlqKey;
    constructor(maxSize: number, storage: StorageService, logger: Logger);
    initialize(): Promise<void>;
    enqueue(event: Event): Promise<void>;
    enqueueBatch(events: Event[]): Promise<void>;
    dequeue(count?: number): Event[];
    peek(count?: number): Event[];
    requeue(event: Event): Promise<void>;
    size(): number;
    isEmpty(): boolean;
    clear(): Promise<void>;
    getEvents(): Event[];
    getEventsByType(type: string): Event[];
    getEventsByPriority(priority: EventPriority): Event[];
    removeEvent(eventId: string): Promise<boolean>;
    getDeadLetterQueue(): Promise<Event[]>;
    clearDeadLetterQueue(): Promise<void>;
    private sortByPriority;
    private removeLowestPriorityEvent;
    private persist;
    private loadPersistedEvents;
    private moveToDeadLetterQueue;
}
//# sourceMappingURL=EventQueue.d.ts.map