"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConversionTracker = void 0;
const react_1 = require("react");
const ConversionTracker_1 = require("../core/ConversionTracker");
function useConversionTracker(config) {
    const [tracker, setTracker] = (0, react_1.useState)(null);
    const [isInitialized, setIsInitialized] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        const initTracker = async () => {
            try {
                const instance = ConversionTracker_1.ConversionTracker.getInstance(config);
                await instance.initialize();
                if (isMounted) {
                    setTracker(instance);
                    setIsInitialized(true);
                }
            }
            catch (error) {
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
    }, []);
    const track = (0, react_1.useCallback)(async (eventType, parameters, priority) => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.track(eventType, parameters, priority);
    }, [tracker]);
    const trackPurchase = (0, react_1.useCallback)(async (orderId, value, currency, items) => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.trackPurchase(orderId, value, currency, items);
    }, [tracker]);
    const trackRegistration = (0, react_1.useCallback)(async (method = 'email') => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.trackRegistration(method);
    }, [tracker]);
    const setUserId = (0, react_1.useCallback)(async (userId) => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.setUserId(userId);
    }, [tracker]);
    const setUserProperties = (0, react_1.useCallback)(async (properties) => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.setUserProperties(properties);
    }, [tracker]);
    const requestTracking = (0, react_1.useCallback)(async () => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return 'unavailable';
        }
        return await tracker.requestTrackingPermission();
    }, [tracker]);
    const flush = (0, react_1.useCallback)(async () => {
        if (!tracker) {
            console.warn('Tracker not initialized');
            return;
        }
        await tracker.flush();
    }, [tracker]);
    const getStats = (0, react_1.useCallback)(() => {
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
exports.useConversionTracker = useConversionTracker;
