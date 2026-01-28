# 🎯 Guía Rápida Visual

## ❌ ANTES (Complicado)

```bash
# 1. Instalar el SDK
npm install @itsmikoj/conversation-tracker-sdk

# 2. Instalar dependencias manualmente (😫)
npm install react-native-fbsdk-next
npm install expo-tracking-transparency
npm install @react-native-async-storage/async-storage

# 3. Configurar app.json
{
  "appID": "123456789",
  "clientToken": "abc123"
}

# 4. Repetir en el código (😫)
useConversionTracker({
  providers: {
    meta: {
      appId: "123456789",      // ← Repetido!
      clientToken: "abc123",    // ← Repetido!
    }
  }
})

# 5. Importar con /src (😫)
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk/src'
```

---

## ✅ AHORA (Simplificado)

```bash
# 1. ¡Un solo comando! ✨
npm install @itsmikoj/conversation-tracker-sdk
#    ↓ Instala TODO automáticamente
#    ✅ react-native-fbsdk-next
#    ✅ expo-tracking-transparency
#    ✅ @react-native-async-storage/async-storage
#    ✅ expo-constants
```

```json
// 2. Configura app.json (una sola vez)
{
  "expo": {
    "plugins": [
      ["react-native-fbsdk-next", {
        "appID": "123456789",
        "clientToken": "abc123"
      }]
    ]
  }
}
```

```typescript
// 3. Usa auto-config (sin repetir) ✨
import { 
  useConversionTracker, 
  getMetaConfigFromExpo  // ← Helper mágico
} from '@itsmikoj/conversation-tracker-sdk';  // ← Sin /src

useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...getMetaConfigFromExpo()  // ← Lee de app.json automáticamente
    }
  }
})
```

```bash
# 4. Rebuild nativo
npx expo prebuild --clean
npx expo run:ios
```

---

## 📊 Comparación

| Característica | ANTES | AHORA |
|----------------|-------|-------|
| **Dependencias** | 😫 Instalar 4 paquetes manualmente | ✅ 1 comando instala todo |
| **Configuración** | 😫 Repetir keys en 2 lugares | ✅ Configurar 1 vez en app.json |
| **Importación** | 😫 Con `/src` | ✅ Sin `/src` |
| **Complejidad** | 😫 5 pasos | ✅ 3 pasos |

---

## 🚀 Ejemplo Completo (Mínimo)

```typescript
// App.tsx
import { useConversionTracker, getMetaConfigFromExpo } from '@itsmikoj/conversation-tracker-sdk';

export default function App() {
  const { isInitialized, track } = useConversionTracker({
    providers: {
      meta: {
        enabled: true,
        ...getMetaConfigFromExpo()  // ✨ Magia
      }
    }
  });

  // ¡Listo! 🎉
}
```

**Solo 4 líneas de código real.**

---

## 💡 Tips

### Tip 1: Verifica la instalación

```bash
npm list react-native-fbsdk-next
# Debería mostrar: @itsmikoj/conversation-tracker-sdk > react-native-fbsdk-next@X.X.X
```

### Tip 2: Si necesitas Conversions API

```typescript
useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...getMetaConfigFromExpo(),
      pixelId: 'YOUR_PIXEL_ID',        // Solo agrega esto
      accessToken: 'YOUR_TOKEN',       // Y esto
      enableConversionsAPI: true,      // Y esto
    }
  }
})
```

### Tip 3: Debug

```typescript
useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      ...getMetaConfigFromExpo(),
    }
  },
  debug: true,  // ← Activa logs
  logLevel: 'debug'
})
```

---

## ✅ Checklist Final

- [ ] `npm install @itsmikoj/conversation-tracker-sdk`
- [ ] Configurar `app.json` con appID y clientToken
- [ ] Importar sin `/src`
- [ ] Usar `getMetaConfigFromExpo()` 
- [ ] `npx expo prebuild --clean`
- [ ] `npx expo run:ios`
- [ ] Trackear tu primer evento

**¡Todo listo en 10 minutos!** ⚡
