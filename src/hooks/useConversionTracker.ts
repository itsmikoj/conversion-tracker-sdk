import { useEffect, useState, useCallback } from 'react';
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

/**
 * React hook for using ConversionTracker
 * 
 * @example
 * ```tsx
 * function App() {
 *   const { track, trackPurchase, isInitialized } = useConversionTracker({
 *     providers: {
 *       meta: {
 *         enabled: true,
 *         pixelId: 'YOUR_PIXEL_ID',
 *         appId: 'YOUR_APP_ID',
 *         clientToken: 'YOUR_CLIENT_TOKEN',
 *       },
 *     },
 *   });
 * 
 *   useEffect(() => {
 *     if (isInitialized) {
 *       track(EventType.VIEW_CONTENT, { contentId: 'home' });
 *     }
 *   }, [isInitialized]);
 * 
 *   return <YourApp />;
 * }
 * ```
 */
export function useConversionTracker(config: TrackerConfig): UseConversionTrackerReturn {
  const [tracker, setTracker] = useState<ConversionTracker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initTracker = async () => {
      try {
        const instance = ConversionTracker.getInstance(config);
        await instance.initialize();
        
        if (isMounted) {
          setTracker(instance);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize ConversionTracker:', error);
      }
    };

    initTracker();

    return () => {
      isMounted = false;
      if (tracker) {
        tracker.dispose();
      }
    };
  }, []); // Empty deps - only initialize once

  const track = useCallback(
    async (eventType: EventType | string, parameters?: Record<string, any>, priority?: EventPriority) => {
      if (!tracker) {
        console.warn('Tracker not initialized');
        return;
      }
      await tracker.track(eventType, parameters, priority);
    },
    [tracker]
  );

  const trackPurchase = useCallback(
    async (orderId: string, value: number, currency: string, items: any[]) => {
      if (!tracker) {
        console.warn('Tracker not initialized');
        return;
      }
      await tracker.trackPurchase(orderId, value, currency, items);
    },
    [tracker]
  );

  const trackRegistration = useCallback(
    async (method: string = 'email') => {
      if (!tracker) {
        console.warn('Tracker not initialized');
        return;
      }
      await tracker.trackRegistration(method);
    },
    [tracker]
  );

  const setUserId = useCallback(
    async (userId: string) => {
      if (!tracker) {
        console.warn('Tracker not initialized');
        return;
      }
      await tracker.setUserId(userId);
    },
    [tracker]
  );

  const setUserProperties = useCallback(
    async (properties: UserProperties) => {
      if (!tracker) {
        console.warn('Tracker not initialized');
        return;
      }
      await tracker.setUserProperties(properties);
    },
    [tracker]
  );

  const requestTracking = useCallback(async () => {
    if (!tracker) {
      console.warn('Tracker not initialized');
      return 'unavailable';
    }
    return await tracker.requestTrackingPermission();
  }, [tracker]);

  const flush = useCallback(async () => {
    if (!tracker) {
      console.warn('Tracker not initialized');
      return;
    }
    await tracker.flush();
  }, [tracker]);

  const getStats = useCallback(() => {
    if (!tracker) {
      return null;
    }
    return tracker.getStats();
  }, [tracker]);

  return {
    tracker,
    isInitialized,
    track,
    trackPurchase,
    trackRegistration,
    setUserId,
    setUserProperties,
    requestTracking,
    flush,
    getStats,
  };
}
