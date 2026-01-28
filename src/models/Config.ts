export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  pixelId?: string;
  options?: Record<string, any>;
}

export interface TrackerConfig {
  providers: {
    meta?: ProviderConfig & {
      pixelId: string;
      accessToken?: string;
      testEventCode?: string;
      enableAutoLogging?: boolean;
      enableAdvertiserTracking?: boolean;
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

export const DEFAULT_CONFIG: TrackerConfig = {
  providers: {},
  batchSize: 10,
  batchInterval: 5000,
  maxQueueSize: 100,
  persistEvents: true,
  offlineMode: true,
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
  enableATT: true,
  hashUserData: true,
  anonymizeIP: true,
  dataRetentionDays: 30,
  debug: false,
  debugPanel: false,
  logLevel: 'error',
  enablePerformanceMonitoring: true,
};
