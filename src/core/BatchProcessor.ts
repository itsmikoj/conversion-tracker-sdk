import { Event } from '../models/Event';
import { EventQueue } from './EventQueue';
import { BaseProvider } from '../providers/base/BaseProvider';
import { Logger } from '../utils/Logger';

export interface BatchProcessorConfig {
  batchSize: number;
  batchInterval: number;
  maxConcurrentBatches: number;
  enableAdaptiveBatching?: boolean;
}

export class BatchProcessor {
  private queue: EventQueue;
  private providers: Map<string, BaseProvider>;
  private config: BatchProcessorConfig;
  private logger: Logger;
  private timer?: ReturnType<typeof setInterval>;
  private processing = false;
  private activeBatches = 0;
  private failureCount = 0;
  private successCount = 0;

  constructor(
    queue: EventQueue,
    providers: Map<string, BaseProvider>,
    config: BatchProcessorConfig,
    logger: Logger
  ) {
    this.queue = queue;
    this.providers = providers;
    this.config = config;
    this.logger = logger;
  }

  /**
   * Start batch processing
   */
  start(): void {
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

    // Process immediately on start
    this.processBatch();
  }

  /**
   * Stop batch processing
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
      this.logger.info('BatchProcessor stopped');
    }
  }

  /**
   * Flush all events immediately
   */
  async flush(): Promise<void> {
    this.logger.info('Flushing all events');
    
    while (!this.queue.isEmpty()) {
      await this.processBatch();
      
      // Small delay to prevent overwhelming the system
      await this.sleep(100);
    }
    
    this.logger.info('Flush completed');
  }

  /**
   * Get processing statistics
   */
  getStats(): { successCount: number; failureCount: number; queueSize: number } {
    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      queueSize: this.queue.size(),
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.successCount = 0;
    this.failureCount = 0;
  }

  /**
   * Process a batch of events
   */
  private async processBatch(): Promise<void> {
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

      // Group events by provider
      const eventsByProvider = this.groupEventsByProvider(events);

      // Send to all providers in parallel
      const results = await Promise.allSettled(
        Array.from(eventsByProvider.entries()).map(([providerName, providerEvents]) => 
          this.sendToProvider(providerName, providerEvents)
        )
      );

      // Track results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          this.successCount += result.value;
        } else {
          this.failureCount++;
          this.logger.error('Provider batch failed', result.reason);
        }
      });

    } catch (error) {
      this.logger.error('Batch processing error', error);
      this.failureCount++;
    } finally {
      this.processing = false;
      this.activeBatches--;
    }
  }

  /**
   * Send events to a specific provider
   */
  private async sendToProvider(providerName: string, events: Event[]): Promise<number> {
    const provider = this.providers.get(providerName);
    
    if (!provider || !provider.isEnabled()) {
      this.logger.warn(`Provider ${providerName} not available or disabled`);
      // Re-queue events for retry
      for (const event of events) {
        await this.queue.requeue(event);
      }
      return 0;
    }

    try {
      await provider.sendBatch(events);
      this.logger.debug(`Batch sent to ${providerName}: ${events.length} events`);
      return events.length;
    } catch (error) {
      this.logger.error(`Failed to send batch to ${providerName}`, error);
      
      // Re-queue failed events
      for (const event of events) {
        await this.queue.requeue(event);
      }
      
      throw error;
    }
  }

  /**
   * Group events by provider
   */
  private groupEventsByProvider(events: Event[]): Map<string, Event[]> {
    const grouped = new Map<string, Event[]>();

    // Each event should be sent to all enabled providers
    for (const [name, provider] of this.providers) {
      if (provider.isEnabled()) {
        grouped.set(name, [...events]);
      }
    }

    return grouped;
  }

  /**
   * Get adaptive batch size based on success rate
   */
  private getAdaptiveBatchSize(): number {
    if (!this.config.enableAdaptiveBatching) {
      return this.config.batchSize;
    }

    const totalEvents = this.successCount + this.failureCount;
    
    if (totalEvents < 10) {
      return this.config.batchSize;
    }

    const successRate = this.successCount / totalEvents;

    // Adjust batch size based on success rate
    if (successRate > 0.95) {
      // High success rate: increase batch size
      return Math.min(this.config.batchSize * 1.5, 50);
    } else if (successRate < 0.7) {
      // Low success rate: decrease batch size
      return Math.max(Math.floor(this.config.batchSize / 2), 1);
    }

    return this.config.batchSize;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if processor is running
   */
  isRunning(): boolean {
    return this.timer !== undefined;
  }
}
