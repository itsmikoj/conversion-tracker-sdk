import { Event, EventType } from '../../models/Event';

export interface MetaMappedEvent {
  eventName: string;
  parameters: Record<string, any>;
}

/**
 * Maps internal events to Meta/Facebook event format
 */
export class MetaEventMapper {
  private eventNameMap: Record<string, string> = {
    [EventType.ADD_TO_CART]: 'fb_mobile_add_to_cart',
    [EventType.PURCHASE]: 'fb_mobile_purchase',
    [EventType.INITIATE_CHECKOUT]: 'fb_mobile_initiated_checkout',
    [EventType.ADD_PAYMENT_INFO]: 'fb_mobile_add_payment_info',
    [EventType.COMPLETE_REGISTRATION]: 'fb_mobile_complete_registration',
    [EventType.LOGIN]: 'fb_mobile_login',
    [EventType.START_TRIAL]: 'fb_mobile_start_trial',
    [EventType.SUBSCRIBE]: 'Subscribe',
    [EventType.VIEW_CONTENT]: 'fb_mobile_content_view',
    [EventType.SEARCH]: 'fb_mobile_search',
    [EventType.RATE]: 'fb_mobile_rate',
    [EventType.SHARE]: 'fb_mobile_share',
  };

  private parameterMap: Record<string, string> = {
    value: '_valueToSum',
    currency: 'fb_currency',
    contentType: 'fb_content_type',
    contentId: 'fb_content_id',
    contents: 'fb_content',
    registrationMethod: 'fb_registration_method',
    loginMethod: 'fb_login_method',
    subscriptionType: 'fb_subscription_type',
  };

  /**
   * Map internal event to Meta format
   */
  mapEvent(event: Event): MetaMappedEvent {
    const eventName = this.mapEventName(event.type);
    const parameters = this.mapParameters(event.parameters);

    return {
      eventName,
      parameters,
    };
  }

  /**
   * Map event type to Meta event name
   */
  private mapEventName(eventType: string): string {
    return this.eventNameMap[eventType] || eventType;
  }

  /**
   * Map parameters to Meta format
   */
  private mapParameters(parameters: Record<string, any>): Record<string, any> {
    const mapped: Record<string, any> = {};

    for (const [key, value] of Object.entries(parameters)) {
      const mappedKey = this.parameterMap[key] || key;
      
      if (key === 'contents' && Array.isArray(value)) {
        // Transform contents array
        mapped[mappedKey] = value.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price,
        }));
        mapped['fb_num_items'] = value.reduce((sum, item) => sum + (item.quantity || 1), 0);
        mapped['fb_content_ids'] = value.map(item => item.id);
      } else {
        mapped[mappedKey] = value;
      }
    }

    return mapped;
  }

  /**
   * Check if event should be sent to Meta
   */
  shouldSendEvent(event: Event): boolean {
    // Meta typically tracks all events, but you can add logic here
    // to filter certain events if needed
    return true;
  }

  /**
   * Get Meta standard event name
   */
  getStandardEventName(eventType: EventType): string | undefined {
    return this.eventNameMap[eventType];
  }
}
