import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { Logger } from '../utils/Logger';

export type ATTStatus = 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable';

export class ATTService {
  private logger: Logger;
  private status: ATTStatus = 'not-determined';
  private advertisingId?: string;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Initialize and check current ATT status
   */
  async initialize(): Promise<void> {
    if (Platform.OS !== 'ios') {
      this.status = 'unavailable';
      return;
    }

    try {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      this.status = this.mapStatus(status);
      this.logger.info(`ATT Status: ${this.status}`);

      // Get advertising ID if authorized
      if (this.status === 'authorized') {
        await this.loadAdvertisingId();
      }
    } catch (error) {
      this.logger.error('Failed to initialize ATT', error);
      this.status = 'unavailable';
    }
  }

  /**
   * Request tracking permission
   */
  async requestPermission(): Promise<ATTStatus> {
    if (Platform.OS !== 'ios') {
      this.status = 'unavailable';
      return this.status;
    }

    try {
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      this.status = this.mapStatus(status);
      
      this.logger.info(`ATT Permission requested: ${this.status}`);

      // Get advertising ID if authorized
      if (this.status === 'authorized') {
        await this.loadAdvertisingId();
      }

      return this.status;
    } catch (error) {
      this.logger.error('Failed to request ATT permission', error);
      this.status = 'denied';
      return this.status;
    }
  }

  /**
   * Check if tracking is authorized
   */
  isAuthorized(): boolean {
    return this.status === 'authorized';
  }

  /**
   * Get current status
   */
  getStatus(): ATTStatus {
    return this.status;
  }

  /**
   * Get advertising ID (IDFA)
   */
  getAdvertisingId(): string | undefined {
    return this.advertisingId;
  }

  /**
   * Check if permission can be requested
   */
  canRequestPermission(): boolean {
    return Platform.OS === 'ios' && this.status === 'not-determined';
  }

  private async loadAdvertisingId(): Promise<void> {
    try {
      const id = await TrackingTransparency.getAdvertisingId();
      this.advertisingId = id;
      this.logger.debug(`Advertising ID loaded: ${id ? 'available' : 'unavailable'}`);
    } catch (error) {
      this.logger.warn('Failed to load advertising ID', error);
    }
  }

  private mapStatus(status: string): ATTStatus {
    switch (status) {
      case 'granted':
        return 'authorized';
      case 'denied':
        return 'denied';
      case 'restricted':
        return 'restricted';
      case 'undetermined':
        return 'not-determined';
      default:
        return 'unavailable';
    }
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(): string {
    switch (this.status) {
      case 'authorized':
        return 'Tracking is authorized';
      case 'denied':
        return 'Tracking permission was denied';
      case 'restricted':
        return 'Tracking is restricted by device settings';
      case 'not-determined':
        return 'Tracking permission not requested yet';
      case 'unavailable':
        return 'Tracking transparency not available on this platform';
      default:
        return 'Unknown status';
    }
  }
}
