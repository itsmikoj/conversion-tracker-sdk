import { Event } from '../../models/Event';
import { Logger } from '../../utils/Logger';

export interface ProviderOptions {
  enabled: boolean;
  timeout?: number;
  maxRetries?: number;
  [key: string]: any;
}

export abstract class BaseProvider {
  protected name: string;
  protected enabled: boolean;
  protected logger: Logger;
  protected options: ProviderOptions;

  constructor(name: string, options: ProviderOptions, logger: Logger) {
    this.name = name;
    this.enabled = options.enabled;
    this.options = options;
    this.logger = logger;
  }

  /**
   * Initialize the provider
   */
  abstract initialize(): Promise<void>;

  /**
   * Send a single event
   */
  abstract sendEvent(event: Event): Promise<void>;

  /**
   * Send multiple events in a batch
   */
  abstract sendBatch(events: Event[]): Promise<void>;

  /**
   * Set user ID for tracking
   */
  abstract setUserId(userId: string): Promise<void>;

  /**
   * Set user properties
   */
  abstract setUserProperties(properties: Record<string, any>): Promise<void>;
  
  /**
   * Check if provider is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable the provider
   */
  enable(): void {
    this.enabled = true;
    this.logger.info(`Provider ${this.name} enabled`);
  }

  /**
   * Disable the provider
   */
  disable(): void {
    this.enabled = false;
    this.logger.info(`Provider ${this.name} disabled`);
  }

  /**
   * Get provider name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Execute operation with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `${this.name} operation failed (attempt ${attempt + 1}/${maxRetries + 1})`,
          error
        );

        if (attempt < maxRetries) {
          await this.sleep(delay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Execute operation with timeout
   */
  protected async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate event structure
   */
  protected validateEvent(event: Event): void {
    if (!event.type) {
      throw new Error('Event type is required');
    }
    if (!event.metadata) {
      throw new Error('Event metadata is required');
    }
    if (!event.metadata.timestamp) {
      throw new Error('Event timestamp is required');
    }
  }

  /**
   * Handle provider error
   */
  protected handleError(error: Error, context?: string): void {
    const message = context 
      ? `${this.name} error in ${context}` 
      : `${this.name} error`;
    
    this.logger.error(message, {
      error: error.message,
      stack: error.stack,
    });
  }
}
