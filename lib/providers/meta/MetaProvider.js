"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaProvider = void 0;
const react_native_fbsdk_next_1 = require("react-native-fbsdk-next");
const BaseProvider_1 = require("../base/BaseProvider");
const MetaEventMapper_1 = require("./MetaEventMapper");
const MetaAPIClient_1 = require("./MetaAPIClient");
class MetaProvider extends BaseProvider_1.BaseProvider {
    constructor(options, logger) {
        super('Meta', options, logger);
        this.initialized = false;
        this.mapper = new MetaEventMapper_1.MetaEventMapper();
        if (options.pixelId && options.accessToken && options.enableConversionsAPI !== false) {
            this.apiClient = new MetaAPIClient_1.MetaAPIClient(options.pixelId, options.accessToken, options.testEventCode, logger);
            logger.info('Meta Conversions API client initialized');
        }
        else {
            logger.info('Meta Conversions API not configured (using App Events only)');
        }
    }
    async initialize() {
        if (this.initialized) {
            this.logger.warn('Meta Provider already initialized');
            return;
        }
        try {
            const options = this.options;
            react_native_fbsdk_next_1.Settings.setAppID(options.appId);
            react_native_fbsdk_next_1.Settings.setClientToken(options.clientToken);
            if (options.enableAutoLogging !== false) {
                react_native_fbsdk_next_1.Settings.setAutoLogAppEventsEnabled(true);
            }
            if (options.enableAdvertiserTracking !== false) {
                react_native_fbsdk_next_1.Settings.setAdvertiserTrackingEnabled(true);
            }
            react_native_fbsdk_next_1.Settings.initializeSDK();
            this.initialized = true;
            this.logger.info('Meta Provider initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Meta Provider', error);
            throw error;
        }
    }
    async sendEvent(event) {
        if (!this.initialized) {
            throw new Error('Meta Provider not initialized');
        }
        this.validateEvent(event);
        try {
            const { eventName, parameters } = this.mapper.mapEvent(event);
            react_native_fbsdk_next_1.AppEventsLogger.logEvent(eventName, parameters);
            if (this.apiClient) {
                await this.apiClient.sendEvent(event).catch(error => {
                    this.logger.warn('Conversions API failed, event sent via SDK only', error);
                });
            }
            this.logger.debug(`Meta event sent: ${eventName}`, { parameters });
        }
        catch (error) {
            this.handleError(error, 'sendEvent');
            throw error;
        }
    }
    async sendBatch(events) {
        if (!this.initialized) {
            throw new Error('Meta Provider not initialized');
        }
        if (events.length === 0)
            return;
        try {
            for (const event of events) {
                try {
                    const { eventName, parameters } = this.mapper.mapEvent(event);
                    react_native_fbsdk_next_1.AppEventsLogger.logEvent(eventName, parameters);
                }
                catch (error) {
                    this.logger.error(`Failed to send event in batch: ${event.type}`, error);
                }
            }
            react_native_fbsdk_next_1.AppEventsLogger.flush();
            if (this.apiClient) {
                await this.apiClient.sendBatch(events).catch(error => {
                    this.logger.warn('Conversions API batch failed, events sent via SDK only', error);
                });
            }
            this.logger.debug(`Meta batch sent: ${events.length} events`);
        }
        catch (error) {
            this.handleError(error, 'sendBatch');
            throw error;
        }
    }
    async setUserId(userId) {
        try {
            react_native_fbsdk_next_1.AppEventsLogger.setUserID(userId);
            this.logger.debug('Meta userId set', { userId });
        }
        catch (error) {
            this.handleError(error, 'setUserId');
        }
    }
    async setUserProperties(properties) {
        try {
            react_native_fbsdk_next_1.AppEventsLogger.setUserData(properties);
            this.logger.debug('Meta user properties set', { properties });
        }
        catch (error) {
            this.handleError(error, 'setUserProperties');
        }
    }
    async logPurchase(value, currency, parameters) {
        if (!this.initialized) {
            throw new Error('Meta Provider not initialized');
        }
        try {
            react_native_fbsdk_next_1.AppEventsLogger.logPurchase(value, currency, parameters);
            this.logger.debug('Meta purchase logged', { value, currency, parameters });
        }
        catch (error) {
            this.handleError(error, 'logPurchase');
            throw error;
        }
    }
    async flush() {
        try {
            react_native_fbsdk_next_1.AppEventsLogger.flush();
            this.logger.debug('Meta events flushed');
        }
        catch (error) {
            this.handleError(error, 'flush');
        }
    }
    setDataProcessingOptions(options, country, state) {
        try {
            react_native_fbsdk_next_1.Settings.setDataProcessingOptions(options, country, state);
            this.logger.info('Meta data processing options updated', { options, country, state });
        }
        catch (error) {
            this.handleError(error, 'setDataProcessingOptions');
        }
    }
    setAutoLogAppEventsEnabled(enabled) {
        try {
            react_native_fbsdk_next_1.Settings.setAutoLogAppEventsEnabled(enabled);
            this.logger.info(`Meta auto-logging ${enabled ? 'enabled' : 'disabled'}`);
        }
        catch (error) {
            this.handleError(error, 'setAutoLogAppEventsEnabled');
        }
    }
}
exports.MetaProvider = MetaProvider;
