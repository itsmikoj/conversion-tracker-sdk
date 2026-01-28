import { Platform } from 'react-native';
import { Event, EventBuilder, EventType, EventPriority, EventMetadata } from '../models/Event';
import { TrackerConfig, DEFAULT_CONFIG } from '../models/Config';
import { User, UserProperties } from '../models/User';
import { EventQueue } from './EventQueue';
import { BatchProcessor } from './BatchProcessor';
import { BaseProvider } from '../providers/base/BaseProvider';
import { MetaProvider } from '../providers/meta/MetaProvider';
import { Logger } from '../utils/Logger';
import { StorageService } from '../services/StorageService';
import { ATTService } from '../services/ATTService';
import { NetworkService } from '../services/NetworkService';
import { Validator } from '../utils/Validator';
import { Crypto } from '../utils/Crypto';

export class ConversionTracker {
  private static instance: ConversionTracker;
  private config: TrackerConfig;
  private logger: Logger;
  private storage: StorageService;
  private attService: ATTService;
  private networkService: NetworkService;
  private queue: EventQueue;
  private batchProcessor: BatchProcessor;
  private providers: Map<string, BaseProvider>;
  private user: User;
  private sessionId: string;
  private anonymousId: string;
  private initialized = false;
  private middlewares: Array<(event: Event) => Event | Promise<Event>> = [];

  private constructor(config: TrackerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.logLevel);
    this.storage = new StorageService(this.logger);
    this.attService = new ATTService(this.logger);
    this.networkService = new NetworkService(this.logger);
    this.providers = new Map();
    
    this.sessionId = this.generateUUID();
    this.anonymousId = this.generateUUID();
    
    this.user = new User({
      anonymousId: this.anonymousId,
      deviceId: this.generateDeviceId(),
    });

    this.queue = new EventQueue(
      this.config.maxQueueSize,
      this.storage,
      this.logger
    );

    this.batchProcessor = new BatchProcessor(
      this.queue,
      this.providers,
      {
        batchSize: this.config.batchSize,
        batchInterval: this.config.batchInterval,
        maxConcurrentBatches: 3,
        enableAdaptiveBatching: true,
      },
      this.logger
    );
  }

  public static getInstance(config?: TrackerConfig): ConversionTracker {
    if (!ConversionTracker.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      ConversionTracker.instance = new ConversionTracker(config);
    }
    return ConversionTracker.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('ConversionTracker already initialized');
      return;
    }

    try {
      this.logger.info('Initializing ConversionTracker...');

      const validation = Validator.validateConfig(this.config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      await this.storage.initialize?.();
      await this.networkService.initialize();
      
      if (this.config.enableATT) {
        await this.attService.initialize();
      }

      await this.loadPersistedData();
      await this.queue.initialize();
      await this.initializeProviders();

      this.batchProcessor.start();

      if (this.config.offlineMode) {
        this.setupNetworkListener();
      }

      this.initialized = true;
      this.logger.info('ConversionTracker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ConversionTracker', error);
      throw error;
    }
  }

  public async track(
    eventType: EventType | string,
    parameters?: Record<string, any>,
    priority: EventPriority = EventPriority.MEDIUM
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('ConversionTracker not initialized');
    }

    try {
      const builder = new EventBuilder(eventType)
        .withParameters(parameters || {})
        .withPriority(priority);

      if (this.user.getUserId()) {
        builder.withUserId(this.user.getUserId()!);
      }

      const event = builder.build(this.getEventMetadata());

      const validation = Validator.validateEvent(event);
      if (!validation.valid) {
        this.logger.error('Invalid event', validation.errors);
        return;
      }

      let processedEvent = event;
      for (const middleware of this.middlewares) {
        processedEvent = await middleware(processedEvent);
      }

      await this.queue.enqueue(processedEvent);

      this.logger.debug('Event tracked', { type: eventType, parameters });
    } catch (error) {
      this.logger.error('Failed to track event', error);
    }
  }

  public async trackPurchase(
    orderId: string,
    value: number,
    currency: string,
    items: Array<{ id: string; quantity: number; price?: number }>
  ): Promise<void> {
    await this.track(
      EventType.PURCHASE,
      {
        orderId,
        value,
        currency,
        contents: items,
      },
      EventPriority.HIGH
    );
  }

  public async trackRegistration(method: string = 'email'): Promise<void> {
    await this.track(
      EventType.COMPLETE_REGISTRATION,
      {
        registrationMethod: method,
      },
      EventPriority.HIGH
    );
  }

  public async setUserId(userId: string): Promise<void> {
    this.user.setUserId(userId);
    await this.storage.setItem('user_id', userId);

    for (const provider of this.providers.values()) {
      if (provider.isEnabled()) {
        await provider.setUserId(userId);
      }
    }

    this.logger.info('User ID set', { userId });
  }

  public async setUserProperties(properties: UserProperties): Promise<void> {
    if (this.config.hashUserData) {
      const hashed = Crypto.hashUserData(properties);
      this.user.setHashedProperties(hashed);
    }

    this.user.setProperties(properties);
    await this.storage.setObject('user_properties', properties);

    for (const provider of this.providers.values()) {
      if (provider.isEnabled()) {
        await provider.setUserProperties(properties);
      }
    }

    this.logger.info('User properties set');
  }

  public async requestTrackingPermission(): Promise<string> {
    const status = await this.attService.requestPermission();
    this.logger.info('Tracking permission status', { status });
    return status;
  }

  public getTrackingStatus(): string {
    return this.attService.getStatus();
  }

  public addMiddleware(middleware: (event: Event) => Event | Promise<Event>): void {
    this.middlewares.push(middleware);
  }

  public async flush(): Promise<void> {
    await this.batchProcessor.flush();
    this.logger.info('All events flushed');
  }

  public getStats() {
    return {
      ...this.batchProcessor.getStats(),
      providers: Array.from(this.providers.entries()).map(([name, provider]) => ({
        name,
        enabled: provider.isEnabled(),
      })),
    };
  }

  public async reset(): Promise<void> {
    await this.queue.clear();
    await this.storage.clear();
    this.sessionId = this.generateUUID();
    this.anonymousId = this.generateUUID();
    this.user = new User({
      anonymousId: this.anonymousId,
      deviceId: this.generateDeviceId(),
    });
    this.logger.info('Tracker reset');
  }

  public dispose(): void {
    this.batchProcessor.stop();
    this.networkService.dispose();
    this.initialized = false;
    this.logger.info('Tracker disposed');
  }

  private async initializeProviders(): Promise<void> {
    if (this.config.providers.meta?.enabled) {
      const metaProvider = new MetaProvider(this.config.providers.meta, this.logger);
      await metaProvider.initialize();
      this.providers.set('meta', metaProvider);
      this.logger.info('Meta provider initialized');
    }
  }

  private getEventMetadata(): EventMetadata {
    return {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.user.getUserId(),
      anonymousId: this.anonymousId,
      deviceId: this.user.getIdentifiers().deviceId,
      platform: Platform.OS as 'ios' | 'android',
      appVersion: '1.0.0',
      sdkVersion: '1.0.0',
      locale: 'en-US',
      timezone: 'UTC',
      networkType: this.networkService.getStatus().type,
      isOffline: !this.networkService.isConnected(),
    };
  }

  private generateDeviceId(): string {
    const advertisingId = this.attService.getAdvertisingId();
    return advertisingId || this.generateUUID();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private setupNetworkListener(): void {
    this.networkService.addListener((status) => {
      if (status.isConnected && status.isInternetReachable) {
        this.logger.info('Network connected, processing queued events');
        this.batchProcessor.start();
      }
    });
  }

  private async loadPersistedData(): Promise<void> {
    try {
      const userId = await this.storage.getItem('user_id');
      if (userId) {
        this.user.setUserId(userId);
      }

      const properties = await this.storage.getObject<UserProperties>('user_properties');
      if (properties) {
        this.user.setProperties(properties);
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted data', error);
    }
  }
}
