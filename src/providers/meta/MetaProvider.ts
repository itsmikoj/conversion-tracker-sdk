import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import { BaseProvider, ProviderOptions } from '../base/BaseProvider';
import { Event, EventType } from '../../models/Event';
import { Logger } from '../../utils/Logger';
import { MetaEventMapper } from './MetaEventMapper';
import { MetaAPIClient } from './MetaAPIClient';

export interface MetaProviderOptions extends ProviderOptions {
  appId: string;
  clientToken: string;
  pixelId?: string;  // Optional: only needed for Conversions API or web pixels
  accessToken?: string;
  testEventCode?: string;
  enableAutoLogging?: boolean;
  enableAdvertiserTracking?: boolean;
  enableConversionsAPI?: boolean;
}

export class MetaProvider extends BaseProvider {
  private mapper: MetaEventMapper;
  private apiClient?: MetaAPIClient;
  private initialized = false;

  constructor(options: MetaProviderOptions, logger: Logger) {
    super('Meta', options, logger);
    this.mapper = new MetaEventMapper();
    
    // Initialize Conversions API client only if pixelId and accessToken are provided
    if (options.pixelId && options.accessToken && options.enableConversionsAPI !== false) {
      this.apiClient = new MetaAPIClient(
        options.pixelId,
        options.accessToken,
        options.testEventCode,
        logger
      );
      logger.info('Meta Conversions API client initialized');
    } else {
      logger.info('Meta Conversions API not configured (using App Events only)');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Meta Provider already initialized');
      return;
    }

    try {
      const options = this.options as MetaProviderOptions;

      // Configure Facebook SDK
      Settings.setAppID(options.appId);
      Settings.setClientToken(options.clientToken);
      
      if (options.enableAutoLogging !== false) {
        Settings.setAutoLogAppEventsEnabled(true);
      }
      
      if (options.enableAdvertiserTracking !== false) {
        Settings.setAdvertiserTrackingEnabled(true);
      }

      // Initialize SDK
      Settings.initializeSDK();

      this.initialized = true;
      this.logger.info('Meta Provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Meta Provider', error);
      throw error;
    }
  }

  async sendEvent(event: Event): Promise<void> {
    if (!this.initialized) {
      throw new Error('Meta Provider not initialized');
    }

    this.validateEvent(event);

    try {
      const { eventName, parameters } = this.mapper.mapEvent(event);

      // Send via SDK (client-side)
      AppEventsLogger.logEvent(eventName, parameters);

      // Send via Conversions API (server-side) if available
      if (this.apiClient) {
        await this.apiClient.sendEvent(event).catch(error => {
          // Don't fail the whole operation if CAPI fails
          this.logger.warn('Conversions API failed, event sent via SDK only', error);
        });
      }

      this.logger.debug(`Meta event sent: ${eventName}`, { parameters });
    } catch (error) {
      this.handleError(error as Error, 'sendEvent');
      throw error;
    }
  }

  async sendBatch(events: Event[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Meta Provider not initialized');
    }

    if (events.length === 0) return;

    try {
      // Send each event via SDK
      for (const event of events) {
        try {
          const { eventName, parameters } = this.mapper.mapEvent(event);
          AppEventsLogger.logEvent(eventName, parameters);
        } catch (error) {
          this.logger.error(`Failed to send event in batch: ${event.type}`, error);
          // Continue with other events
        }
      }

      // Flush SDK events
      AppEventsLogger.flush();

      // Send batch via Conversions API if available
      if (this.apiClient) {
        await this.apiClient.sendBatch(events).catch(error => {
          this.logger.warn('Conversions API batch failed, events sent via SDK only', error);
        });
      }

      this.logger.debug(`Meta batch sent: ${events.length} events`);
    } catch (error) {
      this.handleError(error as Error, 'sendBatch');
      throw error;
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      Settings.setUserID(userId);
      this.logger.debug('Meta userId set', { userId });
    } catch (error) {
      this.handleError(error as Error, 'setUserId');
    }
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    try {
      AppEventsLogger.setUserData(properties);
      this.logger.debug('Meta user properties set', { properties });
    } catch (error) {
      this.handleError(error as Error, 'setUserProperties');
    }
  }

  /**
   * Log purchase event (convenience method)
   */
  async logPurchase(value: number, currency: string, parameters?: Record<string, any>): Promise<void> {
    if (!this.initialized) {
      throw new Error('Meta Provider not initialized');
    }

    try {
      AppEventsLogger.logPurchase(value, currency, parameters);
      this.logger.debug('Meta purchase logged', { value, currency, parameters });
    } catch (error) {
      this.handleError(error as Error, 'logPurchase');
      throw error;
    }
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    try {
      AppEventsLogger.flush();
      this.logger.debug('Meta events flushed');
    } catch (error) {
      this.handleError(error as Error, 'flush');
    }
  }

  /**
   * Update user consent for data processing
   */
  setDataProcessingOptions(options: string[], country?: number, state?: number): void {
    try {
      Settings.setDataProcessingOptions(options, country, state);
      this.logger.info('Meta data processing options updated', { options, country, state });
    } catch (error) {
      this.handleError(error as Error, 'setDataProcessingOptions');
    }
  }

  /**
   * Enable/disable auto-init
   */
  setAutoInitEnabled(enabled: boolean): void {
    try {
      Settings.setAutoInitEnabled(enabled);
      this.logger.info(`Meta auto-init ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      this.handleError(error as Error, 'setAutoInitEnabled');
    }
  }
}
