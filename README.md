# Conversion Tracker SDK

SDK profesional para tracking de conversiones en React Native con Meta Ads.

## 🚀 Instalación Rápida

```bash
npm install @itsmikoj/conversation-tracker-sdk
```

## ⚙️ Configuración (app.json)

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

## 💻 Uso Básico

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

## 📦 Rebuild Nativo

```bash
npx expo prebuild --clean
npx expo run:ios
```

## 📖 Métodos Principales

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

## 🎯 Tipos de Eventos

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

## ⚡ Características

- ✅ **Queue Offline**: Eventos se guardan y envían cuando hay conexión
- ✅ **Reintentos Automáticos**: 3 intentos antes de fallar
- ✅ **Batch Processing**: Agrupa eventos para optimizar red
- ✅ **TypeScript**: Tipado completo
- ✅ **Multi-Provider**: Facebook, Google, Apple (próximamente)
- ✅ **Conversions API**: Tracking server-side opcional
- ✅ **Monitoreo**: Stats y Dead Letter Queue

## 🔧 Configuración Avanzada

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

## 📊 Monitoreo

```typescript
// Ver estadísticas
const stats = getStats();
console.log(stats);
// { successCount: 150, failureCount: 2, queueSize: 5 }

// Ver eventos fallidos
const dlq = await tracker.queue.getDeadLetterQueue();
console.log('Eventos fallidos:', dlq);
```

## 🔑 Credenciales de Meta

### App ID y Client Token (REQUERIDOS)

1. Ve a https://developers.facebook.com/apps
2. Crea o selecciona tu app
3. Settings → Basic
4. Copia **App ID** y **Client Token**

### Pixel ID y Access Token (OPCIONALES - solo para Conversions API)

1. Ve a https://business.facebook.com/events_manager
2. Crea un Dataset para tu app
3. Settings → Conversions API → Generate Access Token

## ⚠️ Troubleshooting

### Eventos no aparecen en Meta

- Espera 24-48 horas (es normal)
- Verifica en "Activity" no en "Test Events"
- Asegúrate de haber hecho `npx expo prebuild --clean`

### Error al importar

```typescript
// ✅ Correcto
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk';

// ❌ Incorrecto
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk/src';
```

### EBUSY error (Windows)

Cierra VS Code y terminales, luego:
```bash
Remove-Item -Recurse -Force node_modules
npm install
```

## 📚 Documentación Completa

Ver `/docs/API.md` para referencia completa de todos los métodos y configuraciones.

## 📄 Licencia

MIT

## 🆘 Soporte

Issues: https://github.com/itsmikoj/conversation-tracker-sdk/issues
