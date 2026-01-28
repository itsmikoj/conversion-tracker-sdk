# Guía de Configuración Mínima

## ✅ Configuración Básica (Solo App Events)

**Esto es TODO lo que necesitas para empezar:**

```typescript
import { useConversionTracker, EventType } from '@your-org/conversion-tracker-sdk';

function App() {
  const { isInitialized, track } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        appId: 'YOUR_FB_APP_ID',           // De developers.facebook.com
        clientToken: 'YOUR_CLIENT_TOKEN',   // De developers.facebook.com
      },
    },
  });

  useEffect(() => {
    if (isInitialized) {
      track(EventType.VIEW_CONTENT, { contentType: 'home' });
    }
  }, [isInitialized]);

  return <YourApp />;
}
```

**Con solo `appId` y `clientToken` puedes:**
- ✅ Trackear eventos en tu app
- ✅ Ver analytics en Facebook Analytics
- ✅ Medir engagement de usuarios
- ✅ Trackear conversiones básicas

---

## 📊 Configuración Avanzada (Con Conversions API)

**Solo necesitas esto SI:**
- Quieres tracking server-side (más preciso)
- Necesitas mejor atribución en iOS 14+
- Quieres optimizar campañas publicitarias

```typescript
const { isInitialized, track } = useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      
      // Básico
      appId: 'YOUR_FB_APP_ID',
      clientToken: 'YOUR_CLIENT_TOKEN',
      
      // Para Conversions API
      pixelId: 'YOUR_PIXEL_ID',             // De Events Manager
      accessToken: 'YOUR_ACCESS_TOKEN',      // De Events Manager → Conversions API
      enableConversionsAPI: true,
    },
  },
});
```

---

## 🔑 Dónde Obtener Cada Credencial

### 1. App ID y Client Token (REQUERIDOS)

1. Ve a: https://developers.facebook.com/apps
2. Click en tu app
3. Ve a **Settings → Basic**
4. Ahí verás:
   - **App ID**: `123456789012345`
   - **Client Token**: (scroll down) `abc123def456`

### 2. Pixel ID (OPCIONAL - Solo para Conversions API)

**Opción 1: Desde Events Manager**
1. Ve a: https://business.facebook.com/events_manager
2. Si ya tienes un pixel, verás el ID en la columna izquierda
3. Si no tienes, en el wizard selecciona **"App"** (no "Web")
4. El Dataset ID que te dan es tu Pixel ID

**Opción 2: Desde tu App**
1. Ve a: https://developers.facebook.com/apps
2. Click en tu app
3. En el menú izquierdo busca **"App Events"**
4. El **Dataset ID** que ves ahí es tu Pixel ID

### 3. Access Token (OPCIONAL - Solo para Conversions API)

1. Ve a: https://business.facebook.com/events_manager
2. Click en tu Pixel/Dataset
3. Ve a **Settings**
4. Busca la sección **"Conversions API"**
5. Click en **"Generate Access Token"**
6. Copia el token

---

## ❓ FAQ

### ¿Necesito pixelId?
**NO**, solo si quieres usar Conversions API (tracking server-side avanzado).

### ¿Qué pasa si solo uso appId y clientToken?
Funciona perfecto. Los eventos se envían vía Facebook SDK y aparecen en Facebook Analytics.

### ¿Cuándo debería agregar Conversions API?
- Tienes campañas publicitarias en Meta
- Necesitas mejor atribución en iOS 14+
- Quieres datos más precisos para optimizar ads

### ¿El pixelId es lo mismo que el App ID?
NO. Son diferentes:
- **App ID**: Tu aplicación de Facebook
- **Pixel ID**: Dataset específico para eventos (opcional)

---

## 🚀 Ejemplo Mínimo Completo

```typescript
// app.json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "123456789012345",
          "clientToken": "abc123def456",
          "displayName": "Mi App",
          "advertiserIDCollectionEnabled": true
        }
      ],
      "expo-tracking-transparency"
    ]
  }
}
```

```typescript
// App.tsx
import { useConversionTracker, EventType } from '@your-org/conversion-tracker-sdk';

export default function App() {
  const { isInitialized, track, trackPurchase } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        appId: '123456789012345',      // Reemplaza con tu App ID
        clientToken: 'abc123def456',    // Reemplaza con tu Client Token
      },
    },
    debug: __DEV__,
  });

  useEffect(() => {
    if (isInitialized) {
      // Track app open
      track(EventType.VIEW_CONTENT, { contentType: 'app' });
    }
  }, [isInitialized]);

  const handlePurchase = () => {
    trackPurchase('order-123', 99.99, 'USD', [
      { id: 'product-1', quantity: 1, price: 99.99 }
    ]);
  };

  return (
    <View>
      <Button title="Comprar" onPress={handlePurchase} />
    </View>
  );
}
```

**¡Eso es todo! Con esto ya estás trackeando eventos.** 🎉
