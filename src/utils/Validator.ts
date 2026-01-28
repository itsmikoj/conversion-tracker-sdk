import { Event, EventType } from '../models/Event';

export class Validator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (basic validation)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * Validate currency code (ISO 4217)
   */
  static isValidCurrency(currency: string): boolean {
    const currencyRegex = /^[A-Z]{3}$/;
    return currencyRegex.test(currency);
  }

  /**
   * Validate event structure
   */
  static validateEvent(event: Event): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

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
    } else {
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

    // Validate commerce events
    if (event.type === EventType.PURCHASE || event.type === EventType.ADD_TO_CART) {
      if (!event.parameters.value || event.parameters.value <= 0) {
        errors.push('Value must be greater than 0 for commerce events');
      }
      if (!event.parameters.currency) {
        errors.push('Currency is required for commerce events');
      } else if (!this.isValidCurrency(event.parameters.currency)) {
        errors.push('Invalid currency code');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate configuration
   */
  static validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.providers || Object.keys(config.providers).length === 0) {
      errors.push('At least one provider must be configured');
    }

    if (config.batchSize && config.batchSize < 1) {
      errors.push('Batch size must be at least 1');
    }

    if (config.maxQueueSize && config.maxQueueSize < 1) {
      errors.push('Max queue size must be at least 1');
    }

    // Validate Meta provider config
    if (config.providers.meta?.enabled) {
      // Only appId and clientToken are required
      // pixelId is optional (only needed for web pixels or advanced tracking)
      if (!config.providers.meta.appId) {
        errors.push('Meta app ID is required');
      }
      if (!config.providers.meta.clientToken) {
        errors.push('Meta client token is required');
      }
      // pixelId is optional
      // accessToken is optional (only for Conversions API)
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize user input
   */
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate and sanitize parameters
   */
  static sanitizeParameters(parameters: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value;
      } else if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeParameters(value);
      }
    }

    return sanitized;
  }
}
