import { useCallback } from 'react';
import { ConversionTracker } from '../core/ConversionTracker';
import { EventType, EventPriority } from '../models/Event';

export interface UseEventTrackerReturn {
  trackAddToCart: (itemId: string, price: number, currency?: string) => Promise<void>;
  trackViewContent: (contentId: string, contentType?: string) => Promise<void>;
  trackSearch: (query: string) => Promise<void>;
  trackShare: (contentType: string, contentId: string) => Promise<void>;
  trackLogin: (method?: string) => Promise<void>;
  trackStartTrial: () => Promise<void>;
  trackSubscribe: (subscriptionType: string) => Promise<void>;
  trackInitiateCheckout: (value: number, currency: string) => Promise<void>;
  trackAddPaymentInfo: () => Promise<void>;
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => Promise<void>;
}

export function useEventTracker(): UseEventTrackerReturn {
  const getTracker = (): ConversionTracker => {
    try {
      return ConversionTracker.getInstance();
    } catch (error) {
      throw new Error('ConversionTracker not initialized. Use useConversionTracker hook first.');
    }
  };

  const trackAddToCart = useCallback(
    async (itemId: string, price: number, currency: string = 'USD') => {
      const tracker = getTracker();
      await tracker.track(EventType.ADD_TO_CART, {
        contentId: itemId,
        value: price,
        currency,
        contentType: 'product',
      });
    },
    []
  );

  const trackViewContent = useCallback(
    async (contentId: string, contentType: string = 'product') => {
      const tracker = getTracker();
      await tracker.track(EventType.VIEW_CONTENT, {
        contentId,
        contentType,
      });
    },
    []
  );

  const trackSearch = useCallback(
    async (query: string) => {
      const tracker = getTracker();
      await tracker.track(EventType.SEARCH, {
        searchQuery: query,
      });
    },
    []
  );

  const trackShare = useCallback(
    async (contentType: string, contentId: string) => {
      const tracker = getTracker();
      await tracker.track(EventType.SHARE, {
        contentType,
        contentId,
      });
    },
    []
  );

  const trackLogin = useCallback(
    async (method: string = 'email') => {
      const tracker = getTracker();
      await tracker.track(EventType.LOGIN, {
        loginMethod: method,
      }, EventPriority.HIGH);
    },
    []
  );

  const trackStartTrial = useCallback(
    async () => {
      const tracker = getTracker();
      await tracker.track(EventType.START_TRIAL, {}, EventPriority.HIGH);
    },
    []
  );

  const trackSubscribe = useCallback(
    async (subscriptionType: string) => {
      const tracker = getTracker();
      await tracker.track(EventType.SUBSCRIBE, {
        subscriptionType,
      }, EventPriority.HIGH);
    },
    []
  );

  const trackInitiateCheckout = useCallback(
    async (value: number, currency: string = 'USD') => {
      const tracker = getTracker();
      await tracker.track(EventType.INITIATE_CHECKOUT, {
        value,
        currency,
      }, EventPriority.HIGH);
    },
    []
  );

  const trackAddPaymentInfo = useCallback(
    async () => {
      const tracker = getTracker();
      await tracker.track(EventType.ADD_PAYMENT_INFO, {}, EventPriority.HIGH);
    },
    []
  );

  const trackCustomEvent = useCallback(
    async (eventName: string, parameters?: Record<string, any>) => {
      const tracker = getTracker();
      await tracker.track(eventName, parameters);
    },
    []
  );

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
