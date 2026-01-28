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
# Instalación simple - instala automáticamente todas las dependencias
npm install @itsmikoj/conversation-tracker-sdk

# o
yarn add @itsmikoj/conversation-tracker-sdk
```

**Dependencias instaladas automáticamente:**
- ✅ `react-native-fbsdk-next`
- ✅ `expo-tracking-transparency`
- ✅ `@react-native-async-storage/async-storage`
- ✅ `expo-constants`

**No necesitas instalar nada más manualmente.**

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
// ✅ Importación correcta (sin /src)
import { useConversionTracker, getMetaConfigFromExpo } from '@itsmikoj/conversation-tracker-sdk';
import { EventType } from '@itsmikoj/conversation-tracker-sdk';

function App() {
  const { isInitialized, track, trackPurchase, requestTracking } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...getMetaConfigFromExpo(),  // ✨ Auto-carga appId y clientToken
        
        // OPCIONAL: Solo si usas Conversions API
        // pixelId: 'YOUR_PIXEL_ID',
        // accessToken: 'YOUR_ACCESS_TOKEN',
        // enableConversionsAPI: true,
      },
    },
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
// ✅ Importación correcta
import { useEventTracker } from '@itsmikoj/conversation-tracker-sdk';

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
      
      // Required
      appId: 'YOUR_FB_APP_ID',
      clientToken: 'YOUR_CLIENT_TOKEN',
      
      // Optional
      pixelId: 'YOUR_PIXEL_ID',           // Only for Conversions API
      accessToken: 'YOUR_ACCESS_TOKEN',   // Only for Conversions API
      enableConversionsAPI: false,        // Set true if using CAPI
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

---

## 🚀 Configuración Simplificada (Sin Repetir Keys)

### **Opción 1: Auto-Config desde app.json**

```typescript
import { useConversionTracker, getMetaConfigFromExpo } from '@your-org/conversion-tracker-sdk';

const metaConfig = getMetaConfigFromExpo(); // Lee automáticamente de app.json

const { isInitialized } = useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...metaConfig,  // ✨ Auto-carga appId y clientToken
    },
  },
});
```

### **Opción 2: Variables de Entorno**

```bash
# .env
META_APP_ID=123456789012345
META_CLIENT_TOKEN=abc123def456
```

```javascript
// app.config.js
export default {
  expo: {
    plugins: [
      ['react-native-fbsdk-next', {
        appID: process.env.META_APP_ID,
        clientToken: process.env.META_CLIENT_TOKEN,
      }]
    ]
  }
};
```

```typescript
// App.tsx
import { META_APP_ID, META_CLIENT_TOKEN } from '@env';

useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      appId: META_APP_ID,
      clientToken: META_CLIENT_TOKEN,
    },
  },
});
```

Ver guía completa: [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md)

