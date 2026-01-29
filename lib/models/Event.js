"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBuilder = exports.EventPriority = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["ADD_TO_CART"] = "add_to_cart";
    EventType["PURCHASE"] = "purchase";
    EventType["INITIATE_CHECKOUT"] = "initiate_checkout";
    EventType["ADD_PAYMENT_INFO"] = "add_payment_info";
    EventType["COMPLETE_REGISTRATION"] = "complete_registration";
    EventType["LOGIN"] = "login";
    EventType["START_TRIAL"] = "start_trial";
    EventType["SUBSCRIBE"] = "subscribe";
    EventType["VIEW_CONTENT"] = "view_content";
    EventType["SEARCH"] = "search";
    EventType["RATE"] = "rate";
    EventType["SHARE"] = "share";
    EventType["CUSTOM"] = "custom";
})(EventType || (exports.EventType = EventType = {}));
var EventPriority;
(function (EventPriority) {
    EventPriority[EventPriority["LOW"] = 0] = "LOW";
    EventPriority[EventPriority["MEDIUM"] = 1] = "MEDIUM";
    EventPriority[EventPriority["HIGH"] = 2] = "HIGH";
    EventPriority[EventPriority["CRITICAL"] = 3] = "CRITICAL";
})(EventPriority || (exports.EventPriority = EventPriority = {}));
class EventBuilder {
    constructor(type, name) {
        this.event = {
            id: this.generateId(),
            type,
            name: name || type,
            parameters: {},
            priority: EventPriority.MEDIUM,
            retryCount: 0,
            maxRetries: 3,
            createdAt: Date.now(),
        };
    }
    withParameters(parameters) {
        this.event.parameters = { ...this.event.parameters, ...parameters };
        return this;
    }
    withPriority(priority) {
        this.event.priority = priority;
        return this;
    }
    withUserId(userId) {
        if (!this.event.metadata)
            this.event.metadata = {};
        this.event.metadata.userId = userId;
        return this;
    }
    withMaxRetries(maxRetries) {
        this.event.maxRetries = maxRetries;
        return this;
    }
    build(metadata) {
        return {
            ...this.event,
            metadata: {
                ...metadata,
                ...this.event.metadata,
            },
        };
    }
    generateId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.EventBuilder = EventBuilder;
