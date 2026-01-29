"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const Event_1 = require("../models/Event");
class Validator {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }
    static isValidCurrency(currency) {
        const currencyRegex = /^[A-Z]{3}$/;
        return currencyRegex.test(currency);
    }
    static validateEvent(event) {
        const errors = [];
        if (!event.id) {
            errors.push('Event ID is required');
        }
        if (!event.type) {
            errors.push('Event type is required');
        }
        if (!event.name) {
            errors.push('Event name is required');
        }
        if (!event.metadata) {
            errors.push('Event metadata is required');
        }
        else {
            if (!event.metadata.timestamp) {
                errors.push('Event timestamp is required');
            }
            if (!event.metadata.sessionId) {
                errors.push('Session ID is required');
            }
            if (!event.metadata.anonymousId) {
                errors.push('Anonymous ID is required');
            }
        }
        if (event.type === Event_1.EventType.PURCHASE || event.type === Event_1.EventType.ADD_TO_CART) {
            if (!event.parameters.value || event.parameters.value <= 0) {
                errors.push('Value must be greater than 0 for commerce events');
            }
            if (!event.parameters.currency) {
                errors.push('Currency is required for commerce events');
            }
            else if (!this.isValidCurrency(event.parameters.currency)) {
                errors.push('Invalid currency code');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static validateConfig(config) {
        const errors = [];
        if (!config.providers || Object.keys(config.providers).length === 0) {
            errors.push('At least one provider must be configured');
        }
        if (config.batchSize && config.batchSize < 1) {
            errors.push('Batch size must be at least 1');
        }
        if (config.maxQueueSize && config.maxQueueSize < 1) {
            errors.push('Max queue size must be at least 1');
        }
        if (config.providers.meta?.enabled) {
            if (!config.providers.meta.appId) {
                errors.push('Meta app ID is required');
            }
            if (!config.providers.meta.clientToken) {
                errors.push('Meta client token is required');
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static sanitizeString(input) {
        return input.trim().replace(/[<>]/g, '');
    }
    static sanitizeParameters(parameters) {
        const sanitized = {};
        for (const [key, value] of Object.entries(parameters)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            }
            else if (typeof value === 'number' || typeof value === 'boolean') {
                sanitized[key] = value;
            }
            else if (Array.isArray(value)) {
                sanitized[key] = value;
            }
            else if (value && typeof value === 'object') {
                sanitized[key] = this.sanitizeParameters(value);
            }
        }
        return sanitized;
    }
}
exports.Validator = Validator;
