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
export declare function useEventTracker(): UseEventTrackerReturn;
//# sourceMappingURL=useEventTracker.d.ts.map