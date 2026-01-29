import { Logger } from '../utils/Logger';
export type ATTStatus = 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable';
export declare class ATTService {
    private logger;
    private status;
    private advertisingId?;
    constructor(logger: Logger);
    initialize(): Promise<void>;
    requestPermission(): Promise<ATTStatus>;
    isAuthorized(): boolean;
    getStatus(): ATTStatus;
    getAdvertisingId(): string | undefined;
    canRequestPermission(): boolean;
    private loadAdvertisingId;
    private mapStatus;
    getStatusMessage(): string;
}
//# sourceMappingURL=ATTService.d.ts.map