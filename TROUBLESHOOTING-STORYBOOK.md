# Troubleshooting: Storybook On-Device muestra pantalla en blanco

## Problema
Storybook se carga pero muestra una pantalla en blanco sin stories.

## Posibles causas y soluciones

### 1. Verificar que las stories se están cargando

Ejecuta en la terminal:
```bash
cat .storybook/storybook.requires.ts | grep "normalizedStories"
```

Deberías ver las stories listadas. Si está vacío, regenera:
```bash
# Detén Metro y reinicia
npm run storybook-native
```

### 2. Verificar el formato de preview.tsx

El archivo `.storybook/preview.tsx` debe exportar un objeto `preview` con este formato:

```tsx
import type { Preview } from '@storybook/react-native';

const preview: Preview = {
  decorators: [...],
  parameters: {...}
};

export default preview;
```

**NO** uses `export const decorators = [...]` directamente.

### 3. Simplificar el decorador temporalmente

Si el problema persiste, prueba con un decorador mínimo:

```tsx
const preview: Preview = {
  decorators: [
    (Story: any) => {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Story />
        </View>
      );
    },
  ],
  parameters: {},
};
```

### 4. Verificar errores en la consola

Abre la consola de Metro y busca errores relacionados con:
- `GluestackUIProvider`
- `SafeAreaProvider`
- `setMockState`
- Imports de stories

### 5. Verificar que las stories tienen el formato correcto

Las stories deben usar `@storybook/react-native`:

```tsx
import { Meta, StoryObj } from '@storybook/react-native';
```

**NO** uses `@storybook/react`.

### 6. Regenerar storybook.requires.ts

Si las stories no aparecen, regenera el archivo:

1. Detén Metro
2. Elimina `.storybook/storybook.requires.ts`
3. Reinicia Metro: `npm run storybook-native`
4. El archivo se regenerará automáticamente

### 7. Verificar la ruta de acceso

Asegúrate de navegar a `/storybook` en tu app, no a otra ruta.

### 8. Probar sin decoradores

Temporalmente, comenta los decoradores en `preview.tsx`:

```tsx
const preview: Preview = {
  decorators: [],
  parameters: {},
};
```

Si funciona sin decoradores, el problema está en el decorador (probablemente `GluestackUIProvider`).

### 9. Verificar que expo-dev-client está instalado

El error menciona que `expo-dev-client` no está instalado. Instálalo:

```bash
npx expo install expo-dev-client
```

### 10. Verificar logs de Metro

Busca en los logs de Metro mensajes como:
- "Stories found: X"
- Errores de importación
- Errores de compilación

## Debugging paso a paso

1. **Simplifica preview.tsx** - Usa el decorador mínimo
2. **Verifica stories** - Asegúrate de que al menos una story se carga
3. **Revisa consola** - Busca errores de JavaScript
4. **Prueba sin providers** - Comenta `GluestackUIProvider` temporalmente
5. **Verifica imports** - Asegúrate de que todos los imports son correctos

## Comandos útiles

```bash
# Ver stories cargadas
cat .storybook/storybook.requires.ts | grep "directory"

# Regenerar storybook.requires.ts
rm .storybook/storybook.requires.ts && npm run storybook-native

# Ver errores de Metro
npm run storybook-native 2>&1 | grep -i error
```





