# Conversion Tracker SDK

Enterprise-grade conversion tracking SDK for React Native with Meta Ads, Google Analytics, and Apple Search Ads integration.

## Features

✅ **Multi-Provider Support**: Meta Ads, Google Analytics, Apple Search Ads  
✅ **Offline Queue**: Events are queued and sent when connection is restored  
✅ **Batch Processing**: Efficient event batching with adaptive sizing  
✅ **Priority System**: Critical events are sent first  
✅ **iOS 14+ Support**: Full ATT (App Tracking Transparency) integration  
✅ **Conversions API**: Server-side tracking backup for Meta  
✅ **TypeScript**: Fully typed for better DX  
✅ **React Hooks**: Easy integration with React Native apps  
✅ **Privacy Compliant**: GDPR, CCPA ready with data hashing  
✅ **Retries & DLQ**: Automatic retries with Dead Letter Queue  

## Installation

### From Private GitHub Repository

```bash
# Add to package.json
{
  "dependencies": {
    "@your-org/conversion-tracker-sdk": "github:your-org/conversion-tracker-sdk#v1.0.0"
  }
}

# Install
npm install
# or
yarn install
```

### Authentication

Create `.npmrc` in your project root:

```
@your-org:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### Peer Dependencies

```bash
npm install react-native-fbsdk-next expo-tracking-transparency @react-native-async-storage/async-storage @react-native-community/netinfo
```

## Quick Start

### 1. Configure app.json (Expo)

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
        "NSUserTrackingUsageDescription": "We use tracking to provide personalized ads and improve your experience"
      }
    }
  }
}
```

### 2. Initialize in App.tsx

```typescript
import { useConversionTracker } from '@your-org/conversion-tracker-sdk';
import { EventType } from '@your-org/conversion-tracker-sdk';

function App() {
  const { isInitialized, track, trackPurchase, requestTracking } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        pixelId: 'YOUR_PIXEL_ID',
        appId: 'YOUR_FB_APP_ID',
        clientToken: 'YOUR_CLIENT_TOKEN',
        accessToken: 'YOUR_ACCESS_TOKEN', // Optional, for Conversions API
        enableConversionsAPI: true,
      },
    },
    batchSize: 10,
    batchInterval: 5000,
    debug: __DEV__,
  });

  useEffect(() => {
    if (isInitialized) {
      // Request tracking permission on iOS
      requestTracking();
      
      // Track app open
      track(EventType.VIEW_CONTENT, { contentType: 'app_open' });
    }
  }, [isInitialized]);

  return <YourApp />;
}
```

### 3. Track Events

```typescript
import { useEventTracker } from '@your-org/conversion-tracker-sdk';

function ProductScreen({ productId, price }) {
  const { trackAddToCart, trackViewContent } = useEventTracker();

  useEffect(() => {
    trackViewContent(productId, 'product');
  }, [productId]);

  const handleAddToCart = () => {
    trackAddToCart(productId, price, 'USD');
  };

  return <Button onPress={handleAddToCart}>Add to Cart</Button>;
}
```

### 4. Track Purchase

```typescript
const handleCheckout = async () => {
  await trackPurchase(
    orderId,
    totalAmount,
    'USD',
    items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))
  );
};
```

## Advanced Usage

### Custom Middleware

```typescript
import { ConversionTracker } from '@your-org/conversion-tracker-sdk';

const tracker = ConversionTracker.getInstance(config);

// Add custom middleware
tracker.addMiddleware(async (event) => {
  // Enrich event with custom data
  event.parameters.customField = 'value';
  return event;
});

await tracker.initialize();
```

### Manual Initialization

```typescript
import { ConversionTracker, EventType } from '@your-org/conversion-tracker-sdk';

const tracker = ConversionTracker.getInstance({
  providers: {
    meta: {
      enabled: true,
      pixelId: 'YOUR_PIXEL_ID',
      appId: 'YOUR_FB_APP_ID',
      clientToken: 'YOUR_CLIENT_TOKEN',
    },
  },
});

await tracker.initialize();

// Track events
await tracker.track(EventType.PURCHASE, {
  value: 99.99,
  currency: 'USD',
});

// Set user
await tracker.setUserId('user-123');
await tracker.setUserProperties({
  email: 'user@example.com',
  firstName: 'John',
});

// Flush events
await tracker.flush();
```

### Monitoring

```typescript
// Get statistics
const stats = tracker.getStats();
console.log(stats);
// {
//   successCount: 150,
//   failureCount: 2,
//   queueSize: 5,
//   providers: [{ name: 'Meta', enabled: true }]
// }

// Access Dead Letter Queue
const dlq = await tracker.queue.getDeadLetterQueue();
console.log('Failed events:', dlq);
```

## Event Types

```typescript
EventType.ADD_TO_CART
EventType.PURCHASE
EventType.INITIATE_CHECKOUT
EventType.ADD_PAYMENT_INFO
EventType.COMPLETE_REGISTRATION
EventType.LOGIN
EventType.START_TRIAL
EventType.SUBSCRIBE
EventType.VIEW_CONTENT
EventType.SEARCH
EventType.RATE
EventType.SHARE
```

## Configuration Options

```typescript
interface TrackerConfig {
  providers: {
    meta?: MetaProviderOptions;
    // Add more providers
  };
  
  // Batching
  batchSize: number;              // Default: 10
  batchInterval: number;          // Default: 5000ms
  maxQueueSize: number;           // Default: 100
  
  // Network
  timeout: number;                // Default: 10000ms
  maxRetries: number;             // Default: 3
  
  // Privacy
  enableATT: boolean;             // Default: true
  hashUserData: boolean;          // Default: true
  
  // Debug
  debug: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
}
```

## Meta Ads Setup

1. **Facebook Business Manager**: Create app and get credentials
2. **iOS Configuration**: Add `NSUserTrackingUsageDescription` to Info.plist
3. **SKAdNetwork**: Add Meta's SKAdNetwork IDs
4. **Test Events**: Use test event code during development

```typescript
meta: {
  enabled: true,
  pixelId: 'YOUR_PIXEL_ID',
  appId: 'YOUR_FB_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  testEventCode: 'TEST12345', // For testing
}
```

## Best Practices

1. **Initialize Early**: Initialize tracker as soon as possible
2. **Request ATT**: Request tracking permission before tracking
3. **Batch Events**: Let the SDK handle batching automatically
4. **High Priority**: Use HIGH priority for revenue events
5. **Flush on Exit**: Call `flush()` before app closes
6. **Monitor DLQ**: Regularly check dead letter queue for issues
7. **Test Mode**: Use test event codes in development

## Troubleshooting

### Events not appearing in Meta

1. Check Meta Events Manager
2. Verify pixel ID and app credentials
3. Use test event code to see events immediately
4. Check ATT permission status
5. Verify network connectivity

### Queue growing too large

1. Check network connection
2. Verify provider credentials
3. Check logs for errors
4. Increase batch size
5. Reduce batch interval

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/conversion-tracker-sdk/issues
- Documentation: https://your-org.github.io/conversion-tracker-sdk
