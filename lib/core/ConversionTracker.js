"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionTracker = void 0;
const react_native_1 = require("react-native");
const Event_1 = require("../models/Event");
const Config_1 = require("../models/Config");
const User_1 = require("../models/User");
const EventQueue_1 = require("./EventQueue");
const BatchProcessor_1 = require("./BatchProcessor");
const MetaProvider_1 = require("../providers/meta/MetaProvider");
const Logger_1 = require("../utils/Logger");
const StorageService_1 = require("../services/StorageService");
const ATTService_1 = require("../services/ATTService");
const NetworkService_1 = require("../services/NetworkService");
const Validator_1 = require("../utils/Validator");
const Crypto_1 = require("../utils/Crypto");
class ConversionTracker {
    constructor(config) {
        this.initialized = false;
        this.middlewares = [];
        this.config = { ...Config_1.DEFAULT_CONFIG, ...config };
        this.logger = new Logger_1.Logger(this.config.logLevel);
        this.storage = new StorageService_1.StorageService(this.logger);
        this.attService = new ATTService_1.ATTService(this.logger);
        this.networkService = new NetworkService_1.NetworkService(this.logger);
        this.providers = new Map();
        this.sessionId = this.generateUUID();
        this.anonymousId = this.generateUUID();
        this.user = new User_1.User({
            anonymousId: this.anonymousId,
            deviceId: this.generateDeviceId(),
        });
        this.queue = new EventQueue_1.EventQueue(this.config.maxQueueSize, this.storage, this.logger);
        this.batchProcessor = new BatchProcessor_1.BatchProcessor(this.queue, this.providers, {
            batchSize: this.config.batchSize,
            batchInterval: this.config.batchInterval,
            maxConcurrentBatches: 3,
            enableAdaptiveBatching: true,
        }, this.logger);
    }
    static getInstance(config) {
        if (!ConversionTracker.instance) {
            if (!config) {
                throw new Error('Configuration required for first initialization');
            }
            ConversionTracker.instance = new ConversionTracker(config);
        }
        return ConversionTracker.instance;
    }
    async initialize() {
        if (this.initialized) {
            this.logger.warn('ConversionTracker already initialized');
            return;
        }
        try {
            this.logger.info('Initializing ConversionTracker...');
            const validation = Validator_1.Validator.validateConfig(this.config);
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
        }
        catch (error) {
            this.logger.error('Failed to initialize ConversionTracker', error);
            throw error;
        }
    }
    async track(eventType, parameters, priority = Event_1.EventPriority.MEDIUM) {
        if (!this.initialized) {
            throw new Error('ConversionTracker not initialized');
        }
        try {
            const builder = new Event_1.EventBuilder(eventType)
                .withParameters(parameters || {})
                .withPriority(priority);
            if (this.user.getUserId()) {
                builder.withUserId(this.user.getUserId());
            }
            const event = builder.build(this.getEventMetadata());
            const validation = Validator_1.Validator.validateEvent(event);
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
        }
        catch (error) {
            this.logger.error('Failed to track event', error);
        }
    }
    async trackPurchase(orderId, value, currency, items) {
        await this.track(Event_1.EventType.PURCHASE, {
            orderId,
            value,
            currency,
            contents: items,
        }, Event_1.EventPriority.HIGH);
    }
    async trackRegistration(method = 'email') {
        await this.track(Event_1.EventType.COMPLETE_REGISTRATION, {
            registrationMethod: method,
        }, Event_1.EventPriority.HIGH);
    }
    async setUserId(userId) {
        this.user.setUserId(userId);
        await this.storage.setItem('user_id', userId);
        for (const provider of this.providers.values()) {
            if (provider.isEnabled()) {
                await provider.setUserId(userId);
            }
        }
        this.logger.info('User ID set', { userId });
    }
    async setUserProperties(properties) {
        if (this.config.hashUserData) {
            const hashed = Crypto_1.Crypto.hashUserData(properties);
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
    async requestTrackingPermission() {
        const status = await this.attService.requestPermission();
        this.logger.info('Tracking permission status', { status });
        return status;
    }
    getTrackingStatus() {
        return this.attService.getStatus();
    }
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }
    async flush() {
        await this.batchProcessor.flush();
        this.logger.info('All events flushed');
    }
    getStats() {
        return {
            ...this.batchProcessor.getStats(),
            providers: Array.from(this.providers.entries()).map(([name, provider]) => ({
                name,
                enabled: provider.isEnabled(),
            })),
        };
    }
    async reset() {
        await this.queue.clear();
        await this.storage.clear();
        this.sessionId = this.generateUUID();
        this.anonymousId = this.generateUUID();
        this.user = new User_1.User({
            anonymousId: this.anonymousId,
            deviceId: this.generateDeviceId(),
        });
        this.logger.info('Tracker reset');
    }
    dispose() {
        this.batchProcessor.stop();
        this.networkService.dispose();
        this.initialized = false;
        this.logger.info('Tracker disposed');
    }
    async initializeProviders() {
        if (this.config.providers.meta?.enabled) {
            const metaProvider = new MetaProvider_1.MetaProvider(this.config.providers.meta, this.logger);
            await metaProvider.initialize();
            this.providers.set('meta', metaProvider);
            this.logger.info('Meta provider initialized');
        }
    }
    getEventMetadata() {
        return {
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.user.getUserId(),
            anonymousId: this.anonymousId,
            deviceId: this.user.getIdentifiers().deviceId,
            platform: react_native_1.Platform.OS,
            appVersion: '1.0.0',
            sdkVersion: '1.0.0',
            locale: 'en-US',
            timezone: 'UTC',
            networkType: this.networkService.getStatus().type,
            isOffline: !this.networkService.isConnected(),
        };
    }
    generateDeviceId() {
        const advertisingId = this.attService.getAdvertisingId();
        return advertisingId || this.generateUUID();
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    setupNetworkListener() {
        this.networkService.addListener((status) => {
            if (status.isConnected && status.isInternetReachable) {
                this.logger.info('Network connected, processing queued events');
                this.batchProcessor.start();
            }
        });
    }
    async loadPersistedData() {
        try {
            const userId = await this.storage.getItem('user_id');
            if (userId) {
                this.user.setUserId(userId);
            }
            const properties = await this.storage.getObject('user_properties');
            if (properties) {
                this.user.setProperties(properties);
            }
        }
        catch (error) {
            this.logger.warn('Failed to load persisted data', error);
        }
    }
}
exports.ConversionTracker = ConversionTracker;
