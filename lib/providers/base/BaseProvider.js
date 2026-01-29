"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
class BaseProvider {
    constructor(name, options, logger) {
        this.name = name;
        this.enabled = options.enabled;
        this.options = options;
        this.logger = logger;
    }
    isEnabled() {
        return this.enabled;
    }
    enable() {
        this.enabled = true;
        this.logger.info(`Provider ${this.name} enabled`);
    }
    disable() {
        this.enabled = false;
        this.logger.info(`Provider ${this.name} disabled`);
    }
    getName() {
        return this.name;
    }
    async executeWithRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`${this.name} operation failed (attempt ${attempt + 1}/${maxRetries + 1})`, error);
                if (attempt < maxRetries) {
                    await this.sleep(delay * Math.pow(2, attempt));
                }
            }
        }
        throw lastError;
    }
    async executeWithTimeout(operation, timeout) {
        return Promise.race([
            operation(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)),
        ]);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    validateEvent(event) {
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
    handleError(error, context) {
        const message = context
            ? `${this.name} error in ${context}`
            : `${this.name} error`;
        this.logger.error(message, {
            error: error.message,
            stack: error.stack,
        });
    }
}
exports.BaseProvider = BaseProvider;
