import Constants from 'expo-constants';

/**
 * Auto-configuration helper
 * Reads Meta credentials from app.json/app.config.js automatically
 */
export function getMetaConfigFromExpo() {
  const expoConfig = Constants.expoConfig;
  
  // Find Facebook SDK plugin config
  const fbPlugin = expoConfig?.plugins?.find((plugin: any) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === 'react-native-fbsdk-next';
    }
    return false;
  });

  if (!fbPlugin || !Array.isArray(fbPlugin)) {
    console.warn('Facebook SDK plugin not found in app.json/app.config.js');
    return null;
  }

  const fbConfig = fbPlugin[1];

  return {
    appId: fbConfig.appID,
    clientToken: fbConfig.clientToken,
  };
}

/**
 * Example usage:
 * 
 * ```typescript
 * import { getMetaConfigFromExpo } from '@your-org/conversion-tracker-sdk/helpers';
 * 
 * const metaConfig = getMetaConfigFromExpo();
 * 
 * const { isInitialized } = useConversionTracker({
 *   providers: {
 *     meta: {
 *       enabled: true,
 *       ...metaConfig,  // Auto-loads appId and clientToken
 *     },
 *   },
 * });
 * ```
 */
