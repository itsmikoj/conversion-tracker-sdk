# 📦 Instalación Simplificada

## ✅ Instalación en Un Solo Comando

```bash
npm install @itsmikoj/conversation-tracker-sdk
```

**¡Eso es todo!** El SDK instalará automáticamente:
- ✅ `react-native-fbsdk-next`
- ✅ `expo-tracking-transparency`
- ✅ `@react-native-async-storage/async-storage`
- ✅ `expo-constants`

---

## 📝 Configuración

### 1. Configura `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "123456789012345",
          "clientToken": "abc123def456",
          "displayName": "Tu App"
        }
      ],
      "expo-tracking-transparency"
    ],
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "Para personalizar tu experiencia"
      }
    }
  }
}
```

### 2. Usa el SDK (Importación Simple)

```typescript
// ✅ CORRECTO - Sin /src
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk';

// ❌ INCORRECTO - NO uses /src
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk/src';
```

### 3. Inicializa (Auto-Config)

```typescript
import { 
  useConversionTracker, 
  getMetaConfigFromExpo 
} from '@itsmikoj/conversation-tracker-sdk';

export default function App() {
  const metaConfig = getMetaConfigFromExpo(); // ✨ Auto-carga de app.json

  const { isInitialized, track } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...metaConfig,  // ✨ No necesitas escribir appId/clientToken
      },
    },
  });

  // Listo para usar!
}
```

---

## 🚀 Rebuild Nativo

Después de instalar, reconstruye la app:

```bash
# Para Expo
npx expo prebuild --clean
npx expo run:ios

# Para React Native CLI
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## ❓ FAQ

### ¿Por qué tengo que hacer `npx expo prebuild`?

Porque el SDK instala dependencias nativas (react-native-fbsdk-next) que necesitan código nativo.

### ¿Puedo usar sin compilar TypeScript?

Sí, el SDK está configurado para usar `src/` directamente. No necesitas correr `npm run build`.

### ¿Las dependencias se instalan automáticamente?

Sí, al hacer `npm install @itsmikoj/conversation-tracker-sdk`, todas las dependencias se instalan automáticamente.

### Error: "Cannot find module 'react-native-fbsdk-next'"

Esto significa que necesitas reconstruir la app nativa:

```bash
npx expo prebuild --clean
```

---

## 📖 Ejemplo Completo

```typescript
// App.tsx
import React, { useEffect } from 'react';
import { View, Button } from 'react-native';
import { 
  useConversionTracker, 
  getMetaConfigFromExpo,
  EventType 
} from '@itsmikoj/conversation-tracker-sdk';

export default function App() {
  const { isInitialized, track, trackPurchase } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...getMetaConfigFromExpo(),
      },
    },
  });

  useEffect(() => {
    if (isInitialized) {
      track(EventType.VIEW_CONTENT, { contentType: 'home' });
    }
  }, [isInitialized]);

  const handlePurchase = () => {
    trackPurchase('order-1', 99.99, 'USD', [
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

---

## 🎯 Resumen

1. ✅ `npm install @itsmikoj/conversation-tracker-sdk` → Instala todo automáticamente
2. ✅ Configura `app.json` con tus credenciales
3. ✅ Importa sin `/src`: `from '@itsmikoj/conversation-tracker-sdk'`
4. ✅ Usa `getMetaConfigFromExpo()` para no repetir keys
5. ✅ `npx expo prebuild --clean` para rebuild nativo

