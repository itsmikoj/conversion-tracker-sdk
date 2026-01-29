import { Event } from '../../models/Event';
import { Logger } from '../../utils/Logger';
export declare class MetaAPIClient {
    private pixelId;
    private accessToken;
    private testEventCode?;
    private logger;
    private baseUrl;
    constructor(pixelId: string, accessToken: string, testEventCode: string | undefined, logger: Logger);
    sendEvent(event: Event): Promise<void>;
    sendBatch(events: Event[]): Promise<void>;
    private transformEventToConversionsAPI;
    private buildUserData;
    private buildCustomData;
    private sendRequest;
}
//# sourceMappingURL=MetaAPIClient.d.ts.map