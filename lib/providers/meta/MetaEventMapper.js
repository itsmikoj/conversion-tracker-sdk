"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaEventMapper = void 0;
const Event_1 = require("../../models/Event");
class MetaEventMapper {
    constructor() {
        this.eventNameMap = {
            [Event_1.EventType.ADD_TO_CART]: 'fb_mobile_add_to_cart',
            [Event_1.EventType.PURCHASE]: 'fb_mobile_purchase',
            [Event_1.EventType.INITIATE_CHECKOUT]: 'fb_mobile_initiated_checkout',
            [Event_1.EventType.ADD_PAYMENT_INFO]: 'fb_mobile_add_payment_info',
            [Event_1.EventType.COMPLETE_REGISTRATION]: 'fb_mobile_complete_registration',
            [Event_1.EventType.LOGIN]: 'fb_mobile_login',
            [Event_1.EventType.START_TRIAL]: 'fb_mobile_start_trial',
            [Event_1.EventType.SUBSCRIBE]: 'Subscribe',
            [Event_1.EventType.VIEW_CONTENT]: 'fb_mobile_content_view',
            [Event_1.EventType.SEARCH]: 'fb_mobile_search',
            [Event_1.EventType.RATE]: 'fb_mobile_rate',
            [Event_1.EventType.SHARE]: 'fb_mobile_share',
        };
        this.parameterMap = {
            value: '_valueToSum',
            currency: 'fb_currency',
            contentType: 'fb_content_type',
            contentId: 'fb_content_id',
            contents: 'fb_content',
            registrationMethod: 'fb_registration_method',
            loginMethod: 'fb_login_method',
            subscriptionType: 'fb_subscription_type',
        };
    }
    mapEvent(event) {
        const eventName = this.mapEventName(event.type);
        const parameters = this.mapParameters(event.parameters);
        return {
            eventName,
            parameters,
        };
    }
    mapEventName(eventType) {
        return this.eventNameMap[eventType] || eventType;
    }
    mapParameters(parameters) {
        const mapped = {};
        for (const [key, value] of Object.entries(parameters)) {
            const mappedKey = this.parameterMap[key] || key;
            if (key === 'contents' && Array.isArray(value)) {
                mapped[mappedKey] = value.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    item_price: item.price,
                }));
                mapped['fb_num_items'] = value.reduce((sum, item) => sum + (item.quantity || 1), 0);
                mapped['fb_content_ids'] = value.map(item => item.id);
            }
            else {
                mapped[mappedKey] = value;
            }
        }
        return mapped;
    }
    shouldSendEvent(_event) {
        return true;
    }
    getStandardEventName(eventType) {
        return this.eventNameMap[eventType];
    }
}
exports.MetaEventMapper = MetaEventMapper;
