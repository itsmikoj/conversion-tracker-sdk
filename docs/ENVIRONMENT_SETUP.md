# Configuración con Variables de Entorno

## 🎯 Evita Repetir las Keys

### 1. Crea `.env` en la raíz del proyecto

```bash
# .env
META_APP_ID=123456789012345
META_CLIENT_TOKEN=abc123def456
META_PIXEL_ID=987654321  # Opcional
META_ACCESS_TOKEN=EAABs... # Opcional
```

### 2. Instala dotenv para Expo

```bash
npm install react-native-dotenv
```

### 3. Configura `babel.config.js`

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
    ],
  };
};
```

### 4. Configura `app.json` con variables

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": process.env.META_APP_ID,
          "clientToken": process.env.META_CLIENT_TOKEN,
          "displayName": "Tu App"
        }
      ]
    ]
  }
}
```

**NOTA:** Para Expo, usa `app.config.js` en lugar de `app.json`:

```javascript
// app.config.js
export default {
  expo: {
    plugins: [
      [
        'react-native-fbsdk-next',
        {
          appID: process.env.META_APP_ID,
          clientToken: process.env.META_CLIENT_TOKEN,
          displayName: 'Tu App',
        },
      ],
    ],
  },
};
```

### 5. Usa las variables en tu código

```typescript
// App.tsx
import { META_APP_ID, META_CLIENT_TOKEN } from '@env';

const { isInitialized } = useConversionTracker({
  providers: {
    meta: {
      enabled: true,
      appId: META_APP_ID,
      clientToken: META_CLIENT_TOKEN,
    },
  },
});
```

---

## ✅ Ventajas de Este Approach

1. ✅ **DRY**: Las keys están en un solo lugar
2. ✅ **Seguridad**: `.env` no se sube a git
3. ✅ **Flexibilidad**: Diferentes keys para dev/prod
4. ✅ **Limpio**: Código sin hardcoded secrets

---

## 📝 Configuración para diferentes entornos

### Desarrollo
```bash
# .env.development
META_APP_ID=123456789012345
META_CLIENT_TOKEN=dev_token
```

### Producción
```bash
# .env.production
META_APP_ID=987654321098765
META_CLIENT_TOKEN=prod_token
```

---

## 🔐 `.gitignore`

```bash
# Secrets
.env
.env.*
!.env.example
```

### `.env.example` (sí se sube a git)
```bash
META_APP_ID=your_app_id_here
META_CLIENT_TOKEN=your_client_token_here
META_PIXEL_ID=optional
META_ACCESS_TOKEN=optional
```

