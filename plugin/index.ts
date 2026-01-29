const { withPlugins, createRunOncePlugin } = require('@expo/config-plugins');

const withConversionTracker = (config, props = {}) => {
  if (!props.appID) {
    throw new Error('[@itsmikoj/conversion-tracker-sdk] appID is required in plugin config');
  }
  if (!props.clientToken) {
    throw new Error('[@itsmikoj/conversion-tracker-sdk] clientToken is required in plugin config');
  }

  const facebookConfig = {
    appID: props.appID,
    clientToken: props.clientToken,
    displayName: props.displayName || config.name || 'App',
    scheme: props.scheme || `fb${props.appID}`,
    advertiserIDCollectionEnabled: props.advertiserIDCollectionEnabled !== false,
    autoLogAppEventsEnabled: props.autoLogAppEventsEnabled !== false,
    isAutoInitEnabled: props.isAutoInitEnabled !== false,
    iosUserTrackingPermission:
      props.iosUserTrackingPermission ||
      'This identifier will be used to deliver personalized ads to you.',
  };

  return withPlugins(config, [
    [require('react-native-fbsdk-next/plugin'), facebookConfig],

    require('expo-tracking-transparency/plugin'),
  ]);
};

module.exports = createRunOncePlugin(
  withConversionTracker,
  '@itsmikoj/conversion-tracker-sdk',
  '1.0.0'
);
