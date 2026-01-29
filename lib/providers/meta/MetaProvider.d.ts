import { BaseProvider, ProviderOptions } from '../base/BaseProvider';
import { Event } from '../../models/Event';
import { Logger } from '../../utils/Logger';
export interface MetaProviderOptions extends ProviderOptions {
    appId: string;
    clientToken: string;
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string;
    enableAutoLogging?: boolean;
    enableAdvertiserTracking?: boolean;
    enableConversionsAPI?: boolean;
}
export declare class MetaProvider extends BaseProvider {
    private mapper;
    private apiClient?;
    private initialized;
    constructor(options: MetaProviderOptions, logger: Logger);
    initialize(): Promise<void>;
    sendEvent(event: Event): Promise<void>;
    sendBatch(events: Event[]): Promise<void>;
    setUserId(userId: string): Promise<void>;
    setUserProperties(properties: Record<string, any>): Promise<void>;
    logPurchase(value: number, currency: string, parameters?: Record<string, any>): Promise<void>;
    flush(): Promise<void>;
    setDataProcessingOptions(options: string[], country?: number, state?: number): void;
    setAutoLogAppEventsEnabled(enabled: boolean): void;
}
//# sourceMappingURL=MetaProvider.d.ts.map