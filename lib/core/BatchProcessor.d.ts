import { EventQueue } from './EventQueue';
import { BaseProvider } from '../providers/base/BaseProvider';
import { Logger } from '../utils/Logger';
export interface BatchProcessorConfig {
    batchSize: number;
    batchInterval: number;
    maxConcurrentBatches: number;
    enableAdaptiveBatching?: boolean;
}
export declare class BatchProcessor {
    private queue;
    private providers;
    private config;
    private logger;
    private timer?;
    private processing;
    private activeBatches;
    private failureCount;
    private successCount;
    constructor(queue: EventQueue, providers: Map<string, BaseProvider>, config: BatchProcessorConfig, logger: Logger);
    start(): void;
    stop(): void;
    flush(): Promise<void>;
    getStats(): {
        successCount: number;
        failureCount: number;
        queueSize: number;
    };
    resetStats(): void;
    private processBatch;
    private sendToProvider;
    private groupEventsByProvider;
    private getAdaptiveBatchSize;
    private sleep;
    isRunning(): boolean;
}
//# sourceMappingURL=BatchProcessor.d.ts.map