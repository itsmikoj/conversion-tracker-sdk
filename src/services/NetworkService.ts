import { Logger } from '../utils/Logger';

export type NetworkType = 'wifi' | 'cellular' | 'none' | 'unknown';

export interface NetworkStatus {
  isConnected: boolean;
  type: NetworkType;
  isInternetReachable: boolean;
}

export class NetworkService {
  private logger: Logger;
  private currentStatus: NetworkStatus;
  private listeners: Array<(status: NetworkStatus) => void> = [];

  constructor(logger: Logger) {
    this.logger = logger;
    this.currentStatus = {
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    };
  }

  async initialize(): Promise<void> {
    this.logger.info('Network service initialized (mock implementation)');
  }

  dispose(): void {
    this.listeners = [];
  }

  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  isConnected(): boolean {
    return this.currentStatus.isConnected && this.currentStatus.isInternetReachable;
  }

  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async refresh(): Promise<NetworkStatus> {
    return this.getStatus();
  }
}
