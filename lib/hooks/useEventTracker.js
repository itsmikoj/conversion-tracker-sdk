"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEventTracker = void 0;
const react_1 = require("react");
const ConversionTracker_1 = require("../core/ConversionTracker");
const Event_1 = require("../models/Event");
function useEventTracker() {
    const getTracker = () => {
        try {
            return ConversionTracker_1.ConversionTracker.getInstance();
        }
        catch (error) {
            throw new Error('ConversionTracker not initialized. Use useConversionTracker hook first.');
        }
    };
    const trackAddToCart = (0, react_1.useCallback)(async (itemId, price, currency = 'USD') => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.ADD_TO_CART, {
            contentId: itemId,
            value: price,
            currency,
            contentType: 'product',
        });
    }, []);
    const trackViewContent = (0, react_1.useCallback)(async (contentId, contentType = 'product') => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.VIEW_CONTENT, {
            contentId,
            contentType,
        });
    }, []);
    const trackSearch = (0, react_1.useCallback)(async (query) => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.SEARCH, {
            searchQuery: query,
        });
    }, []);
    const trackShare = (0, react_1.useCallback)(async (contentType, contentId) => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.SHARE, {
            contentType,
            contentId,
        });
    }, []);
    const trackLogin = (0, react_1.useCallback)(async (method = 'email') => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.LOGIN, {
            loginMethod: method,
        }, Event_1.EventPriority.HIGH);
    }, []);
    const trackStartTrial = (0, react_1.useCallback)(async () => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.START_TRIAL, {}, Event_1.EventPriority.HIGH);
    }, []);
    const trackSubscribe = (0, react_1.useCallback)(async (subscriptionType) => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.SUBSCRIBE, {
            subscriptionType,
        }, Event_1.EventPriority.HIGH);
    }, []);
    const trackInitiateCheckout = (0, react_1.useCallback)(async (value, currency = 'USD') => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.INITIATE_CHECKOUT, {
            value,
            currency,
        }, Event_1.EventPriority.HIGH);
    }, []);
    const trackAddPaymentInfo = (0, react_1.useCallback)(async () => {
        const tracker = getTracker();
        await tracker.track(Event_1.EventType.ADD_PAYMENT_INFO, {}, Event_1.EventPriority.HIGH);
    }, []);
    const trackCustomEvent = (0, react_1.useCallback)(async (eventName, parameters) => {
        const tracker = getTracker();
        await tracker.track(eventName, parameters);
    }, []);
    return {
        trackAddToCart,
        trackViewContent,
        trackSearch,
        trackShare,
        trackLogin,
        trackStartTrial,
        trackSubscribe,
        trackInitiateCheckout,
        trackAddPaymentInfo,
        trackCustomEvent,
    };
}
exports.useEventTracker = useEventTracker;
