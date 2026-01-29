import { Event } from '../../models/Event';
import { Logger } from '../../utils/Logger';
export interface ProviderOptions {
    enabled: boolean;
    timeout?: number;
    maxRetries?: number;
    [key: string]: any;
}
export declare abstract class BaseProvider {
    protected name: string;
    protected enabled: boolean;
    protected logger: Logger;
    protected options: ProviderOptions;
    constructor(name: string, options: ProviderOptions, logger: Logger);
    abstract initialize(): Promise<void>;
    abstract sendEvent(event: Event): Promise<void>;
    abstract sendBatch(events: Event[]): Promise<void>;
    abstract setUserId(userId: string): Promise<void>;
    abstract setUserProperties(properties: Record<string, any>): Promise<void>;
    isEnabled(): boolean;
    enable(): void;
    disable(): void;
    getName(): string;
    protected executeWithRetry<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    protected executeWithTimeout<T>(operation: () => Promise<T>, timeout: number): Promise<T>;
    protected sleep(ms: number): Promise<void>;
    protected validateEvent(event: Event): void;
    protected handleError(error: Error, context?: string): void;
}
//# sourceMappingURL=BaseProvider.d.ts.map