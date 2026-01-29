export interface ProviderConfig {
    enabled: boolean;
    apiKey?: string;
    pixelId?: string;
    options?: Record<string, any>;
}
export interface TrackerConfig {
    providers: {
        meta?: ProviderConfig & {
            appId: string;
            clientToken: string;
            pixelId?: string;
            accessToken?: string;
            testEventCode?: string;
            enableAutoLogging?: boolean;
            enableAdvertiserTracking?: boolean;
            enableConversionsAPI?: boolean;
        };
        googleAnalytics?: ProviderConfig & {
            measurementId: string;
            apiSecret?: string;
        };
        appleSearchAds?: ProviderConfig;
    };
    batchSize: number;
    batchInterval: number;
    maxQueueSize: number;
    persistEvents: boolean;
    offlineMode: boolean;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
    retryMultiplier: number;
    enableATT: boolean;
    hashUserData: boolean;
    anonymizeIP: boolean;
    dataRetentionDays: number;
    debug: boolean;
    debugPanel: boolean;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    enablePerformanceMonitoring: boolean;
    customEndpoints?: Record<string, string>;
    middleware?: Array<(event: any) => any | Promise<any>>;
}
export declare const DEFAULT_CONFIG: TrackerConfig;
//# sourceMappingURL=Config.d.ts.map