# Installation Guide

## Prerequisites

- React Native 0.60+
- Expo 45+ (if using Expo)
- iOS 13+ / Android 5.0+
- Node.js 16+

## Installation Steps

### 1. Install the SDK

#### From Private GitHub Repository

```bash
npm install @your-org/conversion-tracker-sdk
# or
yarn add @your-org/conversion-tracker-sdk
```

#### Authentication

Create `.npmrc` in your project root:

```
@your-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Generate a GitHub Personal Access Token with `read:packages` scope.

### 2. Install Peer Dependencies

```bash
npm install react-native-fbsdk-next expo-tracking-transparency @react-native-async-storage/async-storage @react-native-community/netinfo
```

### 3. Configure iOS (app.json for Expo)

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_CLIENT_TOKEN",
          "displayName": "Your App Name",
          "advertiserIDCollectionEnabled": true,
          "autoLogAppEventsEnabled": false
        }
      ],
      "expo-tracking-transparency"
    ],
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "We'd like to show you personalized ads",
        "SKAdNetworkItems": [
          {
            "SKAdNetworkIdentifier": "v9wttpbfk9.skadnetwork"
          }
        ]
      }
    }
  }
}
```

### 4. Configure iOS (Native - Info.plist)

```xml
<key>NSUserTrackingUsageDescription</key>
<string>We'd like to show you personalized ads</string>

<key>SKAdNetworkItems</key>
<array>
  <dict>
    <key>SKAdNetworkIdentifier</key>
    <string>v9wttpbfk9.skadnetwork</string>
  </dict>
  <!-- Add more SKAdNetwork IDs from Meta documentation -->
</array>

<key>FacebookAppID</key>
<string>YOUR_FACEBOOK_APP_ID</string>

<key>FacebookClientToken</key>
<string>YOUR_CLIENT_TOKEN</string>

<key>FacebookDisplayName</key>
<string>Your App Name</string>
```

### 5. Rebuild Native Code

```bash
# For Expo
npx expo prebuild --clean

# For React Native CLI
cd ios && pod install && cd ..
npx react-native run-ios
```

## Meta Ads Setup

### 1. Create Facebook App

1. Go to https://developers.facebook.com
2. Create a new app
3. Add Facebook SDK
4. Get App ID, Client Token, and Pixel ID

### 2. Configure Business Manager

1. Create a Business Manager account
2. Add your app to Business Manager
3. Create a Pixel in Events Manager
4. Get Pixel ID

### 3. Get Conversions API Token (Optional)

1. Go to Events Manager
2. Select your Pixel
3. Settings → Conversions API → Generate Access Token

### 4. Configure App Events

1. Go to App Dashboard
2. Settings → Basic → Add Platform (iOS/Android)
3. Configure Bundle ID / Package Name
4. Enable Advanced Matching (recommended)

## Verification

Test your installation:

```typescript
import { ConversionTracker, EventType } from '@your-org/conversion-tracker-sdk';

const tracker = ConversionTracker.getInstance({
  providers: {
    meta: {
      enabled: true,
      pixelId: 'YOUR_PIXEL_ID',
      appId: 'YOUR_APP_ID',
      clientToken: 'YOUR_CLIENT_TOKEN',
      testEventCode: 'TEST12345', // Use test code for development
    },
  },
  debug: true,
});

await tracker.initialize();
await tracker.track(EventType.VIEW_CONTENT, { contentType: 'test' });
```

Check Meta Events Manager to see the test event.

## Troubleshooting

### "ConversionTracker not initialized"

Make sure to call `await tracker.initialize()` before tracking events.

### Events not showing in Meta

1. Verify Pixel ID and App credentials
2. Check Meta Events Manager → Test Events
3. Use test event code during development
4. Check iOS ATT permission status
5. Wait up to 20 minutes for events to appear

### Build errors on iOS

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Module not found errors

Clear cache and reinstall:

```bash
rm -rf node_modules
npm install
# or
yarn install
```

## Next Steps

- [Configuration Guide](./CONFIGURATION.md)
- [Usage Examples](../examples/)
- [API Reference](./API.md)
