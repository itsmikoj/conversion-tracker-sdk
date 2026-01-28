import { Event } from '../../models/Event';
import { Logger } from '../../utils/Logger';
import { Crypto } from '../../utils/Crypto';

/**
 * Meta Conversions API Client
 * Sends events server-side for improved data quality and iOS 14+ tracking
 */
export class MetaAPIClient {
  private pixelId: string;
  private accessToken: string;
  private testEventCode?: string;
  private logger: Logger;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(
    pixelId: string,
    accessToken: string,
    testEventCode: string | undefined,
    logger: Logger
  ) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
    this.testEventCode = testEventCode;
    this.logger = logger;
  }

  /**
   * Send single event via Conversions API
   */
  async sendEvent(event: Event): Promise<void> {
    const data = this.transformEventToConversionsAPI(event);
    
    await this.sendRequest([data]);
  }

  /**
   * Send batch of events via Conversions API
   */
  async sendBatch(events: Event[]): Promise<void> {
    if (events.length === 0) return;

    const data = events.map(event => this.transformEventToConversionsAPI(event));
    
    await this.sendRequest(data);
  }

  /**
   * Transform internal event to Conversions API format
   */
  private transformEventToConversionsAPI(event: Event): any {
    const userData = this.buildUserData(event);
    const customData = this.buildCustomData(event);

    return {
      event_name: event.name,
      event_time: Math.floor(event.metadata.timestamp / 1000),
      event_id: event.id,
      event_source_url: `app://${event.metadata.platform}`,
      action_source: 'app',
      user_data: userData,
      custom_data: customData,
      app_data: {
        advertiser_tracking_enabled: event.metadata.isOffline ? '0' : '1',
        application_tracking_enabled: '1',
      },
    };
  }

  /**
   * Build user data object with hashed PII
   */
  private buildUserData(event: Event): any {
    const userData: any = {
      client_ip_address: undefined, // Should be set on server-side
      client_user_agent: undefined, // Should be set on server-side
    };

    // Add hashed user identifiers if available
    if (event.metadata.userId) {
      userData.external_id = [Crypto.sha256(event.metadata.userId)];
    }

    // Add device identifiers
    if (event.metadata.deviceId) {
      if (event.metadata.platform === 'ios') {
        userData.idfa = event.metadata.deviceId;
      } else {
        userData.madid = event.metadata.deviceId;
      }
    }

    return userData;
  }

  /**
   * Build custom data object
   */
  private buildCustomData(event: Event): any {
    const customData: any = {};

    if (event.parameters.value) {
      customData.value = event.parameters.value;
    }

    if (event.parameters.currency) {
      customData.currency = event.parameters.currency;
    }

    if (event.parameters.contentType) {
      customData.content_type = event.parameters.contentType;
    }

    if (event.parameters.contentId) {
      customData.content_ids = [event.parameters.contentId];
    }

    if (event.parameters.contents) {
      customData.contents = event.parameters.contents;
      customData.num_items = event.parameters.contents.length;
    }

    return customData;
  }

  /**
   * Send request to Conversions API
   */
  private async sendRequest(data: any[]): Promise<void> {
    const url = `${this.baseUrl}/${this.pixelId}/events`;
    
    const body: any = {
      data,
      access_token: this.accessToken,
    };

    if (this.testEventCode) {
      body.test_event_code = this.testEventCode;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Meta Conversions API error: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      this.logger.debug('Meta Conversions API response', result);

      // Check for events with errors
      if (result.events_received !== data.length) {
        this.logger.warn('Not all events were received by Meta Conversions API', result);
      }

    } catch (error) {
      this.logger.error('Failed to send to Meta Conversions API', error);
      throw error;
    }
  }
}
