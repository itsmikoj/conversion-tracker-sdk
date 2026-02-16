# Conversion Tracker SDK

SDK para tracking de conversiones en React Native.
- **Website**: **[Click here](https://dashboard-web-black-nine.vercel.app)**

## Instalación Rápida

Añade un archivo ".npmrc" al root de tu proyecto y colocar lo siguente:
```bash
@itsmikoj:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=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
```

luego instalar

```bash
npm install @itsmikoj/conversation-tracker-sdk

ó

npm install git+https://github.com/itsmikoj/conversation-tracker-sdk.git
```

## Configuración (app.json)

```json
{
  "expo": {
    "plugins": [
      [
        "@itsmikoj/conversation-tracker-sdk",
        {
          "appID": "TU_APP_ID",
          "clientToken": "TU_CLIENT_TOKEN",
          "displayName": "Tu App"
        }
      ]
    ]
  }
}
```

## Uso Básico

```typescript
import { useConversionTracker, getMetaConfigFromExpo, EventType } from '@itsmikoj/conversation-tracker-sdk';

export default function App() {
  const { isInitialized, track, trackPurchase } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...getMetaConfigFromExpo(),  // Auto-carga desde app.json
      },
    },
  });

  // Trackear eventos
  const handleAddToCart = () => {
    track(EventType.ADD_TO_CART, {
      contentId: 'product-123',
      value: 29.99,
      currency: 'USD',
    });
  };

  const handlePurchase = () => {
    trackPurchase('order-456', 99.99, 'USD', [
      { id: 'product-123', quantity: 1, price: 99.99 }
    ]);
  };
}
```

## Rebuild Nativo

```bash
npx expo prebuild --clean
npx expo run:ios
```

## Métodos Principales

### `useConversionTracker(config)`

Hook principal para inicializar el tracker.

**Retorna:**
- `isInitialized` - Si el tracker está listo
- `track(type, params)` - Trackear cualquier evento
- `trackPurchase(orderId, value, currency, items)` - Trackear compra
- `trackRegistration(method)` - Trackear registro
- `setUserId(userId)` - Identificar usuario
- `setUserProperties(props)` - Propiedades del usuario
- `requestTracking()` - Pedir permiso ATT (iOS)
- `flush()` - Forzar envío inmediato
- `getStats()` - Ver estadísticas

### `useEventTracker()`

Hook con métodos específicos para eventos comunes.

**Retorna:**
- `trackAddToCart(itemId, price, currency)`
- `trackViewContent(contentId, type)`
- `trackSearch(query)`
- `trackLogin(method)`
- `trackSubscribe(type)`
- `trackCustomEvent(name, params)`

## Tipos de Eventos

```typescript
EventType.ADD_TO_CART
EventType.PURCHASE
EventType.INITIATE_CHECKOUT
EventType.ADD_PAYMENT_INFO
EventType.COMPLETE_REGISTRATION
EventType.LOGIN
EventType.VIEW_CONTENT
EventType.SEARCH
EventType.START_TRIAL
EventType.SUBSCRIBE
```

### Con Conversions API (Opcional)

```typescript
useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...getMetaConfigFromExpo(),
      pixelId: 'TU_PIXEL_ID',
      accessToken: 'TU_ACCESS_TOKEN',
      enableConversionsAPI: true,
    },
  },
});
```

### Debug Mode

```typescript
useConversionTracker({
  providers: { meta: { enabled: true, ...getMetaConfigFromExpo() } },
  debug: true,
  logLevel: 'debug',
});
```

### Custom Middleware

```typescript
const tracker = ConversionTracker.getInstance(config);

tracker.addMiddleware(async (event) => {
  // Modificar evento antes de enviar
  event.parameters.customField = 'value';
  return event;
});
```

## Monitoreo

```typescript
// Ver estadísticas
const stats = getStats();
console.log(stats);
// { successCount: 150, failureCount: 2, queueSize: 5 }

// Ver eventos fallidos
const dlq = await tracker.queue.getDeadLetterQueue();
console.log('Eventos fallidos:', dlq);
```
