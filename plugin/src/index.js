const { withPlugins, createRunOncePlugin } = require('@expo/config-plugins');

/**
 * Config plugin para Conversion Tracker SDK
 * Configura automáticamente react-native-fbsdk-next y expo-tracking-transparency
 */
const withConversionTracker = (config, props = {}) => {
  // Validar props requeridas
  if (!props.appID) {
    throw new Error('[@itsmikoj/conversion-tracker-sdk] appID is required in plugin config');
  }
  if (!props.clientToken) {
    throw new Error('[@itsmikoj/conversion-tracker-sdk] clientToken is required in plugin config');
  }

  // Configurar Facebook SDK automáticamente
  const facebookConfig = {
    appID: props.appID,
    clientToken: props.clientToken,
    displayName: props.displayName || config.name || 'App',
    scheme: props.scheme || `fb${props.appID}`,
    advertiserIDCollectionEnabled: props.advertiserIDCollectionEnabled !== false,
    autoLogAppEventsEnabled: props.autoLogAppEventsEnabled !== false,
    isAutoInitEnabled: props.isAutoInitEnabled !== false,
    iosUserTrackingPermission: props.iosUserTrackingPermission || 
      'This identifier will be used to deliver personalized ads to you.',
  };

  // Aplicar plugins necesarios
  return withPlugins(config, [
    // Plugin de Facebook SDK
    [require('react-native-fbsdk-next/plugin'), facebookConfig],
    
    // Plugin de Tracking Transparency
    require('expo-tracking-transparency/plugin'),
  ]);
};

module.exports = createRunOncePlugin(
  withConversionTracker,
  '@itsmikoj/conversion-tracker-sdk',
  '1.0.0'
);
