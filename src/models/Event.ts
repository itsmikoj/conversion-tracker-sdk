export enum EventType {
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  INITIATE_CHECKOUT = 'initiate_checkout',
  ADD_PAYMENT_INFO = 'add_payment_info',
  
  COMPLETE_REGISTRATION = 'complete_registration',
  LOGIN = 'login',
  START_TRIAL = 'start_trial',
  SUBSCRIBE = 'subscribe',
  
  VIEW_CONTENT = 'view_content',
  SEARCH = 'search',
  RATE = 'rate',
  SHARE = 'share',
  
  CUSTOM = 'custom',
}

export enum EventPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
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

export class EventBuilder {
  private event: Partial<Event>;

  constructor(type: EventType | string, name?: string) {
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

  withParameters(parameters: EventParameters): this {
    this.event.parameters = { ...this.event.parameters, ...parameters };
    return this;
  }

  withPriority(priority: EventPriority): this {
    this.event.priority = priority;
    return this;
  }

  withUserId(userId: string): this {
    if (!this.event.metadata) this.event.metadata = {} as EventMetadata;
    this.event.metadata.userId = userId;
    return this;
  }

  withMaxRetries(maxRetries: number): this {
    this.event.maxRetries = maxRetries;
    return this;
  }

  build(metadata: EventMetadata): Event {
    return {
      ...this.event,
      metadata: {
        ...metadata,
        ...this.event.metadata,
      },
    } as Event;
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
