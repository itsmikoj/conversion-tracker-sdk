export declare enum EventType {
    ADD_TO_CART = "add_to_cart",
    PURCHASE = "purchase",
    INITIATE_CHECKOUT = "initiate_checkout",
    ADD_PAYMENT_INFO = "add_payment_info",
    COMPLETE_REGISTRATION = "complete_registration",
    LOGIN = "login",
    START_TRIAL = "start_trial",
    SUBSCRIBE = "subscribe",
    VIEW_CONTENT = "view_content",
    SEARCH = "search",
    RATE = "rate",
    SHARE = "share",
    CUSTOM = "custom"
}
export declare enum EventPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    CRITICAL = 3
}
export interface EventMetadata {
    timestamp: number;
    sessionId: string;
    userId?: string;
    anonymousId: string;
    deviceId: string;
    platform: 'ios' | 'android';
    appVersion: string;
    sdkVersion: string;
    locale: string;
    timezone: string;
    networkType?: string;
    isOffline: boolean;
}
export interface EventParameters {
    currency?: string;
    value?: number;
    contentType?: string;
    contentId?: string;
    contents?: Array<{
        id: string;
        quantity: number;
        price?: number;
    }>;
    registrationMethod?: string;
    loginMethod?: string;
    subscriptionType?: string;
    [key: string]: any;
}
export interface Event {
    id: string;
    type: EventType | string;
    name: string;
    parameters: EventParameters;
    metadata: EventMetadata;
    priority: EventPriority;
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    sentAt?: number;
}
export declare class EventBuilder {
    private event;
    constructor(type: EventType | string, name?: string);
    withParameters(parameters: EventParameters): this;
    withPriority(priority: EventPriority): this;
    withUserId(userId: string): this;
    withMaxRetries(maxRetries: number): this;
    build(metadata: EventMetadata): Event;
    private generateId;
}
//# sourceMappingURL=Event.d.ts.map