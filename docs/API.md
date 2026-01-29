# API Reference

## Instalación

```bash
npm install @its

mikoj/conversation-tracker-sdk
```

---

## Configuración

### app.json

```json
{
  "expo": {
    "plugins": [
      ["@itsmikoj/conversation-tracker-sdk", {
        "appID": "123456789",
        "clientToken": "abc123",
        "displayName": "Mi App",
        "advertiserIDCollectionEnabled": true,
        "autoLogAppEventsEnabled": false,
        "iosUserTrackingPermission": "Mensaje personalizado"
      }]
    ]
  }
}
```

**Opciones:**
- `appID` (requerido): App ID de Facebook
- `clientToken` (requerido): Client Token de Facebook
- `displayName` (opcional): Nombre de tu app
- `advertiserIDCollectionEnabled` (opcional): Habilitar collection de Ad ID (default: true)
- `autoLogAppEventsEnabled` (opcional): Auto-logging de Facebook (default: false)
- `iosUserTrackingPermission` (opcional): Mensaje de ATT en iOS

---

## Hooks

### `useConversionTracker(config)`

Inicializa el tracker.

```typescript
const {
  isInitialized,
  tracker,
  track,
  trackPurchase,
  trackRegistration,
  setUserId,
  setUserProperties,
  requestTracking,
  flush,
  getStats
} = useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...getMetaConfigFromExpo(),
      pixelId: 'opcional',
      accessToken: 'opcional',
      enableConversionsAPI: false,
    },
  },
  batchSize: 10,
  batchInterval: 5000,
  maxQueueSize: 100,
  debug: __DEV__,
  logLevel: 'info',
});
```

**Config:**
- `providers.meta.enabled` (boolean): Activar Meta tracking
- `providers.meta.appId` (string): App ID (o usar getMetaConfigFromExpo())
- `providers.meta.clientToken` (string): Client Token
- `providers.meta.pixelId` (string, opcional): Para Conversions API
- `providers.meta.accessToken` (string, opcional): Para Conversions API
- `batchSize` (number): Eventos por batch (default: 10)
- `batchInterval` (number): Intervalo en ms (default: 5000)
- `debug` (boolean): Modo debug

**Returns:**
- `isInitialized` (boolean): Si está listo
- `tracker` (ConversionTracker): Instancia del tracker
- `track` (function): Trackear evento genérico
- `trackPurchase` (function): Trackear compra
- `trackRegistration` (function): Trackear registro
- `setUserId` (function): Identificar usuario
- `setUserProperties` (function): Props del usuario
- `requestTracking` (function): Pedir permiso ATT
- `flush` (function): Forzar envío
- `getStats` (function): Ver estadísticas

---

### `useEventTracker()`

Métodos helpers para eventos comunes.

```typescript
const {
  trackAddToCart,
  trackViewContent,
  trackSearch,
  trackShare,
  trackLogin,
  trackStartTrial,
  trackSubscribe,
  trackInitiateCheckout,
  trackAddPaymentInfo,
  trackCustomEvent
} = useEventTracker();
```

**Métodos:**

#### `trackAddToCart(itemId, price, currency?)`
```typescript
trackAddToCart('product-123', 29.99, 'USD');
```

#### `trackViewContent(contentId, contentType?)`
```typescript
trackViewContent('product-123', 'product');
```

#### `trackSearch(query)`
```typescript
trackSearch('vestido rojo');
```

#### `trackShare(contentType, contentId)`
```typescript
trackShare('product', 'product-123');
```

#### `trackLogin(method?)`
```typescript
trackLogin('email');  // 'email', 'facebook', 'google', etc.
```

#### `trackStartTrial()`
```typescript
trackStartTrial();
```

#### `trackSubscribe(subscriptionType)`
```typescript
trackSubscribe('monthly');
```

#### `trackInitiateCheckout(value, currency?)`
```typescript
trackInitiateCheckout(99.99, 'USD');
```

#### `trackAddPaymentInfo()`
```typescript
trackAddPaymentInfo();
```

#### `trackCustomEvent(eventName, parameters?)`
```typescript
trackCustomEvent('custom_event', {
  customParam1: 'value1',
  customParam2: 123
});
```

---

## Métodos del Tracker

### `track(eventType, parameters?, priority?)`

Trackear cualquier evento.

```typescript
await track(EventType.VIEW_CONTENT, {
  contentId: 'product-123',
  contentType: 'product',
  value: 29.99,
  currency: 'USD'
}, EventPriority.MEDIUM);
```

**Parámetros:**
- `eventType` (EventType | string): Tipo de evento
- `parameters` (object, opcional): Parámetros del evento
- `priority` (EventPriority, opcional): CRITICAL, HIGH, MEDIUM, LOW

---

### `trackPurchase(orderId, value, currency, items)`

Trackear compra.

```typescript
await trackPurchase('order-456', 99.99, 'USD', [
  { id: 'product-123', quantity: 2, price: 29.99 },
  { id: 'product-456', quantity: 1, price: 40.01 }
]);
```

---

### `trackRegistration(method?)`

Trackear registro de usuario.

```typescript
await trackRegistration('email');  // 'email', 'facebook', 'google'
```

---

### `setUserId(userId)`

Identificar usuario.

```typescript
await setUserId('user-12345');
```

---

### `setUserProperties(properties)`

Propiedades del usuario.

```typescript
await setUserProperties({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  city: 'New York',
  country: 'US'
});
```

**Propiedades disponibles:**
- `email`, `firstName`, `lastName`, `phone`
- `gender`: 'male' | 'female' | 'other'
- `dateOfBirth`: string (YYYY-MM-DD)
- `city`, `state`, `country`, `zipCode`
- Cualquier propiedad custom

---

### `requestTracking()`

Pedir permiso de tracking (iOS).

```typescript
const status = await requestTracking();
// 'authorized' | 'denied' | 'restricted' | 'not-determined' | 'unavailable'
```

---

### `flush()`

Forzar envío inmediato de eventos.

```typescript
await flush();
```

---

### `getStats()`

Ver estadísticas del tracker.

```typescript
const stats = getStats();
console.log(stats);
// {
//   successCount: 150,
//   failureCount: 2,
//   queueSize: 5,
//   providers: [{ name: 'Meta', enabled: true }]
// }
```

---

## Tipos de Eventos

```typescript
enum EventType {
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  INITIATE_CHECKOUT = 'initiate_checkout',
  ADD_PAYMENT_INFO = 'add_payment_info',
  COMPLETE_REGISTRATION = 'complete_registration',
  LOGIN = 'login',
  START_TRIAL = 'start_trial',
  SUBSCRIBE = 'subscribe',
  VIEW_CONTENT = 'view_content',
  SEARCH = 'search',
  RATE = 'rate',
  SHARE = 'share',
  CUSTOM = 'custom',
}
```

---

## Prioridades

```typescript
enum EventPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
}
```

Eventos con mayor prioridad se envían primero.

---

## Helpers

### `getMetaConfigFromExpo()`

Lee configuración de Meta desde app.json automáticamente.

```typescript
const metaConfig = getMetaConfigFromExpo();
// { appId: '123456789', clientToken: 'abc123' }

useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...metaConfig,  // Expande automáticamente
    },
  },
});
```

---

## Middleware

### `addMiddleware(fn)`

Modificar eventos antes de enviarlos.

```typescript
const tracker = ConversionTracker.getInstance(config);

tracker.addMiddleware(async (event) => {
  // Agregar campo custom
  event.parameters.appVersion = '1.0.0';
  
  // Modificar valores
  if (event.type === EventType.PURCHASE) {
    event.priority = EventPriority.CRITICAL;
  }
  
  return event;
});
```

---

## Monitoreo Avanzado

### Dead Letter Queue

Ver eventos que fallaron después de 3 reintentos.

```typescript
const tracker = ConversionTracker.getInstance();
const dlq = await tracker.queue.getDeadLetterQueue();

console.log('Eventos fallidos:', dlq);

// Limpiar DLQ
await tracker.queue.clearDeadLetterQueue();
```

---

## Troubleshooting

### Eventos no aparecen

**Espera 24-48 horas.** Los eventos de app tardan en aparecer en Meta Events Manager.

Verifica en **"Activity"** no en "Test Events".

### Ver logs

```typescript
useConversionTracker({
  providers: {...},
  debug: true,
  logLevel: 'debug',  // 'none' | 'error' | 'warn' | 'info' | 'debug'
});
```

### Forzar envío

```typescript
await flush();  // Envía todos los eventos inmediatamente
```

---

## Ejemplos Completos

### E-commerce

```typescript
// Ver producto
trackViewContent('product-123', 'product');

// Agregar al carrito
trackAddToCart('product-123', 29.99, 'USD');

// Iniciar checkout
trackInitiateCheckout(99.99, 'USD');

// Agregar info de pago
trackAddPaymentInfo();

// Compra
trackPurchase('order-456', 99.99, 'USD', [
  { id: 'product-123', quantity: 2, price: 29.99 },
  { id: 'product-456', quantity: 1, price: 40.01 }
]);
```

### Suscripción

```typescript
// Usuario ve plan
trackViewContent('plan-premium', 'subscription');

// Inicia trial
trackStartTrial();

// Suscribe
trackSubscribe('monthly');
```

### Usuario

```typescript
// Registro
trackRegistration('email');

// Identificar
setUserId('user-12345');

// Propiedades
setUserProperties({
  email: 'user@example.com',
  firstName: 'John',
});

// Login
trackLogin('email');
```
