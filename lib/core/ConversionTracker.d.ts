import { Event, EventType, EventPriority } from '../models/Event';
import { TrackerConfig } from '../models/Config';
import { UserProperties } from '../models/User';
export declare class ConversionTracker {
    private static instance;
    private config;
    private logger;
    private storage;
    private attService;
    private networkService;
    private queue;
    private batchProcessor;
    private providers;
    private user;
    private sessionId;
    private anonymousId;
    private initialized;
    private middlewares;
    private constructor();
    static getInstance(config?: TrackerConfig): ConversionTracker;
    initialize(): Promise<void>;
    track(eventType: EventType | string, parameters?: Record<string, any>, priority?: EventPriority): Promise<void>;
    trackPurchase(orderId: string, value: number, currency: string, items: Array<{
        id: string;
        quantity: number;
        price?: number;
    }>): Promise<void>;
    trackRegistration(method?: string): Promise<void>;
    setUserId(userId: string): Promise<void>;
    setUserProperties(properties: UserProperties): Promise<void>;
    requestTrackingPermission(): Promise<string>;
    getTrackingStatus(): string;
    addMiddleware(middleware: (event: Event) => Event | Promise<Event>): void;
    flush(): Promise<void>;
    getStats(): {
        providers: {
            name: string;
            enabled: boolean;
        }[];
        successCount: number;
        failureCount: number;
        queueSize: number;
    };
    reset(): Promise<void>;
    dispose(): void;
    private initializeProviders;
    private getEventMetadata;
    private generateDeviceId;
    private generateUUID;
    private setupNetworkListener;
    private loadPersistedData;
}
//# sourceMappingURL=ConversionTracker.d.ts.map