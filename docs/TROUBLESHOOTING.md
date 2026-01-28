# 🔧 Solución de Problemas

## Error: "Cannot find module 'postinstall.js'"

### Causa
El paquete instalado desde GitHub no incluye el script postinstall.

### Solución
**Ignora este error.** Las dependencias ya se instalan automáticamente. 

Si el error impide la instalación:

```bash
# Opción 1: Limpiar e intentar de nuevo
rm -rf node_modules package-lock.json
npm install

# Opción 2: En Windows, cierra VS Code y cualquier terminal
# Luego:
npm install
```

---

## Error: "EBUSY: resource busy or locked"

### Causa
Windows tiene archivos bloqueados (generalmente por VS Code o Metro Bundler).

### Solución

```bash
# 1. Cierra VS Code y todas las terminales
# 2. Cierra Metro Bundler si está corriendo
# 3. Elimina node_modules
rm -rf node_modules package-lock.json

# 4. Reinstala
npm install
```

**En Windows PowerShell:**
```powershell
# Forzar eliminación
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## Error: "Module not found: react-native-fbsdk-next"

### Causa
Las dependencias nativas no están instaladas o necesitas rebuild.

### Solución

```bash
# 1. Verifica que esté instalado
npm list react-native-fbsdk-next

# 2. Si no está, instálalo manualmente
npm install react-native-fbsdk-next

# 3. Rebuild nativo
npx expo prebuild --clean
npx expo run:ios
```

---

## Error: "Invalid configuration: Meta app ID is required"

### Causa
No has configurado las credenciales de Meta.

### Solución

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "TU_APP_ID_AQUI",
          "clientToken": "TU_CLIENT_TOKEN_AQUI",
          "displayName": "Tu App"
        }
      ]
    ]
  }
}
```

---

## Error: Importación con /src no funciona

### Incorrecto
```typescript
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk/src';
```

### Correcto
```typescript
import { useConversionTracker } from '@itsmikoj/conversation-tracker-sdk';
```

---

## Las dependencias no se instalan automáticamente

### Verifica package.json del SDK

El `package.json` del SDK debe tener:

```json
{
  "dependencies": {
    "react-native-fbsdk-next": "^12.2.0",
    "expo-tracking-transparency": "^6.0.8",
    "@react-native-async-storage/async-storage": "^1.17.0",
    "expo-constants": "^17.1.1"
  }
}
```

### Instalación Manual (si falla auto-install)

```bash
npm install react-native-fbsdk-next expo-tracking-transparency @react-native-async-storage/async-storage expo-constants
```

---

## Reinstalación Completa

Si todo falla:

```bash
# 1. Eliminar completamente
rm -rf node_modules package-lock.json
rm -rf ios/Pods ios/Podfile.lock
rm -rf android/.gradle android/build

# 2. Reinstalar
npm install

# 3. Rebuild nativo
npx expo prebuild --clean

# 4. Instalar pods (iOS)
cd ios && pod install && cd ..

# 5. Correr
npx expo run:ios
```

---

## Debug: Verificar Instalación

```bash
# Ver árbol de dependencias
npm list @itsmikoj/conversation-tracker-sdk

# Debería mostrar:
# └─┬ @itsmikoj/conversation-tracker-sdk@1.0.0
#   ├── react-native-fbsdk-next@12.2.0
#   ├── expo-tracking-transparency@6.0.8
#   ├── @react-native-async-storage/async-storage@1.17.0
#   └── expo-constants@17.1.1

# Verificar que el SDK esté en node_modules
ls node_modules/@itsmikoj/conversation-tracker-sdk
```

---

## Aún tienes problemas?

1. **Verifica versiones**
   ```bash
   node --version  # Debe ser >=16
   npm --version   # Debe ser >=8
   ```

2. **Limpia cache de npm**
   ```bash
   npm cache clean --force
   ```

3. **Usa npm en lugar de yarn** (temporalmente)
   ```bash
   npm install
   ```

4. **Revisa los logs**
   ```bash
   # El log completo está en:
   cat ~/.npm/_logs/*-debug-*.log
   ```
