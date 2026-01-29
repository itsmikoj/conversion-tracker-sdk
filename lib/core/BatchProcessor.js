"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchProcessor = void 0;
class BatchProcessor {
    constructor(queue, providers, config, logger) {
        this.processing = false;
        this.activeBatches = 0;
        this.failureCount = 0;
        this.successCount = 0;
        this.queue = queue;
        this.providers = providers;
        this.config = config;
        this.logger = logger;
    }
    start() {
        if (this.timer) {
            this.logger.warn('BatchProcessor already running');
            return;
        }
        this.logger.info('BatchProcessor started', {
            batchSize: this.config.batchSize,
            interval: this.config.batchInterval,
        });
        this.timer = setInterval(() => {
            this.processBatch();
        }, this.config.batchInterval);
        this.processBatch();
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
            this.logger.info('BatchProcessor stopped');
        }
    }
    async flush() {
        this.logger.info('Flushing all events');
        while (!this.queue.isEmpty()) {
            await this.processBatch();
            await this.sleep(100);
        }
        this.logger.info('Flush completed');
    }
    getStats() {
        return {
            successCount: this.successCount,
            failureCount: this.failureCount,
            queueSize: this.queue.size(),
        };
    }
    resetStats() {
        this.successCount = 0;
        this.failureCount = 0;
    }
    async processBatch() {
        if (this.processing || this.queue.isEmpty()) {
            return;
        }
        if (this.activeBatches >= this.config.maxConcurrentBatches) {
            this.logger.debug('Max concurrent batches reached, waiting...');
            return;
        }
        this.processing = true;
        this.activeBatches++;
        try {
            const batchSize = this.getAdaptiveBatchSize();
            const events = this.queue.dequeue(batchSize);
            if (events.length === 0) {
                return;
            }
            this.logger.debug(`Processing batch of ${events.length} events`);
            const eventsByProvider = this.groupEventsByProvider(events);
            const results = await Promise.allSettled(Array.from(eventsByProvider.entries()).map(([providerName, providerEvents]) => this.sendToProvider(providerName, providerEvents)));
            results.forEach((result, _index) => {
                if (result.status === 'fulfilled') {
                    this.successCount += result.value;
                }
                else {
                    this.failureCount++;
                    this.logger.error('Provider batch failed', result.reason);
                }
            });
        }
        catch (error) {
            this.logger.error('Batch processing error', error);
            this.failureCount++;
        }
        finally {
            this.processing = false;
            this.activeBatches--;
        }
    }
    async sendToProvider(providerName, events) {
        const provider = this.providers.get(providerName);
        if (!provider || !provider.isEnabled()) {
            this.logger.warn(`Provider ${providerName} not available or disabled`);
            for (const event of events) {
                await this.queue.requeue(event);
            }
            return 0;
        }
        try {
            await provider.sendBatch(events);
            this.logger.debug(`Batch sent to ${providerName}: ${events.length} events`);
            return events.length;
        }
        catch (error) {
            this.logger.error(`Failed to send batch to ${providerName}`, error);
            for (const event of events) {
                await this.queue.requeue(event);
            }
            throw error;
        }
    }
    groupEventsByProvider(events) {
        const grouped = new Map();
        for (const [name, provider] of this.providers) {
            if (provider.isEnabled()) {
                grouped.set(name, [...events]);
            }
        }
        return grouped;
    }
    getAdaptiveBatchSize() {
        if (!this.config.enableAdaptiveBatching) {
            return this.config.batchSize;
        }
        const totalEvents = this.successCount + this.failureCount;
        if (totalEvents < 10) {
            return this.config.batchSize;
        }
        const successRate = this.successCount / totalEvents;
        if (successRate > 0.95) {
            return Math.min(this.config.batchSize * 1.5, 50);
        }
        else if (successRate < 0.7) {
            return Math.max(Math.floor(this.config.batchSize / 2), 1);
        }
        return this.config.batchSize;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    isRunning() {
        return this.timer !== undefined;
    }
}
exports.BatchProcessor = BatchProcessor;
