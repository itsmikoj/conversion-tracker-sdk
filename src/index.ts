import { ConversionTracker } from './core/ConversionTracker';
import { TrackerConfig } from './models/Config';

export { ConversionTracker } from './core/ConversionTracker';
export { EventQueue } from './core/EventQueue';
export { BatchProcessor } from './core/BatchProcessor';

export {
  Event,
  EventBuilder,
  EventType,
  EventPriority,
  EventMetadata,
  EventParameters,
} from './models/Event';
export { TrackerConfig, DEFAULT_CONFIG, ProviderConfig } from './models/Config';
export { User, UserProperties, UserIdentifiers } from './models/User';

export { BaseProvider, ProviderOptions } from './providers/base/BaseProvider';
export { MetaProvider, MetaProviderOptions } from './providers/meta/MetaProvider';
export { MetaEventMapper } from './providers/meta/MetaEventMapper';

export { StorageService, IStorageService } from './services/StorageService';
export { ATTService, ATTStatus } from './services/ATTService';
export { NetworkService, NetworkStatus, NetworkType } from './services/NetworkService';

export { Logger } from './utils/Logger';
export { Crypto } from './utils/Crypto';
export { Validator } from './utils/Validator';
export { getMetaConfigFromExpo } from './utils/ExpoConfigHelper';

export { useConversionTracker } from './hooks/useConversionTracker';
export { useEventTracker } from './hooks/useEventTracker';

export const initialize = async (config: TrackerConfig): Promise<ConversionTracker> => {
  const tracker = ConversionTracker.getInstance(config);
  await tracker.initialize();
  return tracker;
};
