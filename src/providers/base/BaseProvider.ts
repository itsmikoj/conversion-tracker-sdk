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

  abstract initialize(): Promise<void>;

  abstract sendEvent(event: Event): Promise<void>;

  abstract sendBatch(events: Event[]): Promise<void>;

  abstract setUserId(userId: string): Promise<void>;

  abstract setUserProperties(properties: Record<string, any>): Promise<void>;

  isEnabled(): boolean {
    return this.enabled;
  }

  enable(): void {
    this.enabled = true;
    this.logger.info(`Provider ${this.name} enabled`);
  }

  disable(): void {
    this.enabled = false;
    this.logger.info(`Provider ${this.name} disabled`);
  }

  getName(): string {
    return this.name;
  }

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

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
