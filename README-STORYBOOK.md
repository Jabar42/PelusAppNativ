# Storybook On-Device para React Native

Storybook está configurado para ejecutarse **dentro de tu aplicación React Native** (simulador/Expo), no en el navegador web.

## Cómo usar

### 1. Iniciar Storybook en tu dispositivo/simulador

```bash
npm run storybook-native
```

O simplemente:

```bash
npx expo start --dev-client
```

**Nota:** Metro generará automáticamente el archivo `storybook.requires.ts` cuando inicies el servidor.

### 2. Acceder a Storybook

Una vez que la app esté corriendo en tu simulador/dispositivo:

1. Abre la app Expo
2. Navega a la ruta `/storybook` en tu app
3. Verás la interfaz de Storybook con todas tus stories

### 3. Navegación directa

También puedes acceder directamente desde Expo Router navegando a:
- `/storybook` en tu app

## Estructura de archivos

- `.storybook/main.ts` - Configuración principal de Storybook React Native
- `.storybook/index.tsx` - Punto de entrada de Storybook
- `.storybook/storybook.requires.ts` - Importa todas las stories (se puede regenerar automáticamente)
- `.storybook/preview-native.tsx` - Decoradores y parámetros globales para React Native
- `app/storybook.tsx` - Ruta de Expo Router para acceder a Storybook

## Configuración

### Metro Config

El `metro.config.js` está configurado para integrar Storybook con NativeWind:

```javascript
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
const configWithNativeWind = withNativeWind(config, { input: './global.css' });
module.exports = withStorybook(configWithNativeWind);
```

### Decoradores globales

Todas las stories están envueltas automáticamente con:
- `GluestackUIProvider` - Para los estilos de Gluestack UI
- `SafeAreaProvider` - Para manejar safe areas en dispositivos
- Mock de `authStore` - Para simular estados de autenticación

## Stories disponibles

Las stories se encuentran en:
- `src/**/*.stories.tsx` - Stories de componentes
- `storybook/**/*.stories.tsx` - Stories adicionales

## Notas

- **No uses** `npm run storybook` (ese es para web, que está deshabilitado)
- Storybook On-Device funciona **solo en el simulador/dispositivo**, no en el navegador
- Todas las stories se cargan automáticamente desde los archivos `.stories.tsx`

## Troubleshooting

Si Storybook no aparece:
1. Verifica que Metro esté corriendo correctamente
2. Asegúrate de que la ruta `/storybook` esté accesible en Expo Router
3. Revisa los logs de Metro para errores de compilación
4. Verifica que los addons de Storybook estén instalados:
   - `@storybook/addon-ondevice-controls`
   - `@storybook/addon-ondevice-backgrounds`
   - `@storybook/addon-ondevice-actions`
   - `@storybook/addon-ondevice-notes`











