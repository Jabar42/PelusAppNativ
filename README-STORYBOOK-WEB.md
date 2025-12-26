# Storybook Web para React Native/Expo

Storybook está configurado para ejecutarse en el **navegador web**, usando `react-native-web` para renderizar componentes de React Native.

## Estrategia de Configuración

### Aliases para Versiones Web

En lugar de mockear módulos nativos, Storybook está configurado para **forzar el uso de versiones web** de todas las librerías:

- `react-native` → `react-native-web` (alias directo)
- Extensiones `.web.*` tienen prioridad
- Mocks solo para lógica de negocio (Expo Router, authStore)

### Configuración Clave

1. **Aliases en Webpack** (`.storybook/main.js`):
   ```javascript
   'react-native$': 'react-native-web',
   'react-native': 'react-native-web',
   ```

2. **Extensiones con prioridad web**:
   ```javascript
   extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', ...]
   ```

3. **Transpilación de Gluestack UI**:
   - `@gluestack-ui/*` se transpila con Babel
   - `react-native-svg` se transpila correctamente
   - `react-native-web` incluido en transpilación

## Cómo usar

### 1. Iniciar Storybook

```bash
npm run storybook
```

Esto iniciará Storybook en `http://localhost:6006`

### 2. Acceder a Storybook

Abre tu navegador en:
- `http://localhost:6006`

### 3. Ver tus stories

Todas las stories en:
- `src/**/*.stories.tsx`
- `storybook/**/*.stories.tsx`

Se cargarán automáticamente.

## Estructura de archivos

- `.storybook/main.js` - Configuración de Webpack con aliases web
- `.storybook/preview.tsx` - Decoradores globales con GluestackUIProvider
- `storybook/mocks/` - Mocks solo para lógica de negocio (Expo Router, authStore)

## Decoradores globales

Todas las stories están envueltas automáticamente con:
- `GluestackUIProvider` - Configuración web de Gluestack UI
- `SafeAreaProvider` - Versión web de react-native-safe-area-context
- Mock de `authStore` - Para simular estados de autenticación

## Ventajas de este enfoque

1. **No mocks innecesarios**: Solo mockeamos lógica de negocio, no módulos nativos
2. **Versiones web reales**: Usamos `react-native-web` directamente
3. **Gluestack funciona nativamente**: Gluestack UI detecta automáticamente que está en web
4. **Más simple**: Menos configuración, menos problemas

## Troubleshooting

### Si ves errores de TurboModule

Esto significa que alguna librería está intentando cargar código nativo. Verifica:
1. Que el alias `react-native` → `react-native-web` esté funcionando
2. Que `NormalModuleReplacementPlugin` esté activo
3. Que las extensiones `.web.*` tengan prioridad

### Si Gluestack no renderiza

1. Verifica que `@gluestack-ui/themed` esté en la lista de `include` de Babel
2. Asegúrate de que `react-native-web` esté instalado
3. Revisa la consola del navegador para errores específicos

### Si las stories no aparecen

1. Verifica que los archivos `.stories.tsx` usen `@storybook/react` (no `@storybook/react-native`)
2. Asegúrate de que las stories estén en las rutas configuradas en `main.js`
3. Revisa los logs de Webpack para errores de compilación











