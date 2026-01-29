import Constants from 'expo-constants';

export function getMetaConfigFromExpo() {
  const expoConfig = Constants.expoConfig;

  const ourPlugin = expoConfig?.plugins?.find((plugin: any) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === '@itsmikoj/conversation-tracker-sdk';
    }
    return false;
  });

  if (ourPlugin && Array.isArray(ourPlugin)) {
    const config = ourPlugin[1];
    return {
      appId: config.appID,
      clientToken: config.clientToken,
    };
  }

  // Fallback
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
