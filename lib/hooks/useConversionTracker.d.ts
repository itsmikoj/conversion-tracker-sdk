import { ConversionTracker } from '../core/ConversionTracker';
import { TrackerConfig } from '../models/Config';
import { EventType, EventPriority } from '../models/Event';
import { UserProperties } from '../models/User';
export interface UseConversionTrackerReturn {
    tracker: ConversionTracker | null;
    isInitialized: boolean;
    track: (eventType: EventType | string, parameters?: Record<string, any>, priority?: EventPriority) => Promise<void>;
    trackPurchase: (orderId: string, value: number, currency: string, items: any[]) => Promise<void>;
    trackRegistration: (method?: string) => Promise<void>;
    setUserId: (userId: string) => Promise<void>;
    setUserProperties: (properties: UserProperties) => Promise<void>;
    requestTracking: () => Promise<string>;
    flush: () => Promise<void>;
    getStats: () => any;
}
export declare function useConversionTracker(config: TrackerConfig): UseConversionTrackerReturn;
//# sourceMappingURL=useConversionTracker.d.ts.map