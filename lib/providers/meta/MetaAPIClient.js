"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAPIClient = void 0;
const Crypto_1 = require("../../utils/Crypto");
class MetaAPIClient {
    constructor(pixelId, accessToken, testEventCode, logger) {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.pixelId = pixelId;
        this.accessToken = accessToken;
        this.testEventCode = testEventCode;
        this.logger = logger;
    }
    async sendEvent(event) {
        const data = this.transformEventToConversionsAPI(event);
        await this.sendRequest([data]);
    }
    async sendBatch(events) {
        if (events.length === 0)
            return;
        const data = events.map(event => this.transformEventToConversionsAPI(event));
        await this.sendRequest(data);
    }
    transformEventToConversionsAPI(event) {
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
    buildUserData(event) {
        const userData = {
            client_ip_address: undefined,
            client_user_agent: undefined,
        };
        if (event.metadata.userId) {
            userData.external_id = [Crypto_1.Crypto.sha256(event.metadata.userId)];
        }
        if (event.metadata.deviceId) {
            if (event.metadata.platform === 'ios') {
                userData.idfa = event.metadata.deviceId;
            }
            else {
                userData.madid = event.metadata.deviceId;
            }
        }
        return userData;
    }
    buildCustomData(event) {
        const customData = {};
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
    async sendRequest(data) {
        const url = `${this.baseUrl}/${this.pixelId}/events`;
        const body = {
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
            if (result.events_received !== data.length) {
                this.logger.warn('Not all events were received by Meta Conversions API', result);
            }
        }
        catch (error) {
            this.logger.error('Failed to send to Meta Conversions API', error);
            throw error;
        }
    }
}
exports.MetaAPIClient = MetaAPIClient;
