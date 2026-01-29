import { Logger } from '../utils/Logger';
export type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';
export interface NetworkStatus {
    isConnected: boolean;
    type: NetworkType;
    isInternetReachable: boolean;
}
export declare class NetworkService {
    private logger;
    private currentStatus;
    private listeners;
    constructor(logger: Logger);
    initialize(): Promise<void>;
    dispose(): void;
    getStatus(): NetworkStatus;
    isConnected(): boolean;
    addListener(listener: (status: NetworkStatus) => void): () => void;
    refresh(): Promise<NetworkStatus>;
}
//# sourceMappingURL=NetworkService.d.ts.map