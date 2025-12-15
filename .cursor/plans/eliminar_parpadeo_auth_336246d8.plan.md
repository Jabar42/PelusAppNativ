---
name: Eliminar parpadeo auth
overview: Evitar el flicker donde se ve brevemente el dashboard B2C antes de redirigir al login, ajustando la lógica de protección de rutas en el layout de Expo Router.
todos:
  - id: update-initial-layout-render
    content: Actualizar `InitialLayout` en app/_layout.tsx para usar un render condicional basado en `isLoaded`, `isSignedIn` y `segments`, mostrando LoadingScreen mientras Clerk carga.
    status: completed
---

# Plan para eliminar el parpadeo entre dashboard y login

## Objetivo

Evitar que, al cargar la app, se renderice brevemente el dashboard (tabs) antes de redirigir al login. El problema está en cómo `InitialLayout` decide qué mostrar mientras Clerk todavía está cargando (`isLoaded === false`).

## Causa del parpadeo

- En [`app/_layout.tsx`](/home/jabar/Documents/PelusAppNative/app/_layout.tsx) actualmente:
  - `InitialLayout` siempre retorna `<Slot />` (renderiza la ruta actual) incluso cuando `isLoaded` aún es `false`.
  - La redirección a `/(auth)/login` o `/(tabs)` se hace dentro de un `useEffect` que solo se ejecuta cuando `isLoaded` es `true`.
  - Resultado: mientras Clerk está cargando, Expo Router muestra la ruta por defecto (p. ej. `/(tabs)` → `TIENDA B2C`), y luego, cuando `isLoaded` se actualiza, el `useEffect` hace el `router.replace` hacia login → parpadeo.

## Estrategia de solución

- Mover la lógica de decisión (qué se muestra) al **render** de `InitialLayout`, en lugar de depender solo del `useEffect`.
- Mostrar explícitamente una pantalla de loading mientras `isLoaded === false` (y/o mientras `authStore.isLoading === true`).
- Solo renderizar `<Slot />` cuando:
  - Clerk está cargado (`isLoaded`), **y**
  - La combinación `(isSignedIn, segmentos)` es coherente (no hace falta redirección).
- Usar `Redirect` de `expo-router` (o retorno condicional) en el JSX, en lugar de solo `router.replace` en un efecto secundario.

## Cambios concretos

### 1. Crear/usar una pantalla de loading compartida

- Reutilizar `LoadingScreen` existente en [`src/features/Shared/components/LoadingScreen.tsx`](/home/jabar/Documents/PelusAppNative/src/features/Shared/components/LoadingScreen.tsx).
- Importarlo en [`app/_layout.tsx`](/home/jabar/Documents/PelusAppNative/app/_layout.tsx).

### 2. Reescribir `InitialLayout` para ser "render-driven"

En [`app/_layout.tsx`](/home/jabar/Documents/PelusAppNative/app/_layout.tsx):

- Importar `Redirect` de `expo-router`.
- Cambiar `InitialLayout` a algo del estilo (pseudocódigo):
```tsx
function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  // 1) Mientras Clerk carga → mostrar LoadingScreen, no Slot
  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // 2) Usuario no autenticado fuera de (auth) → ir a login
  if (!isSignedIn && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  // 3) Usuario autenticado dentro de (auth) → ir a tabs
  if (isSignedIn && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  // 4) Estado coherente → renderizar la ruta actual
  return <Slot />;
}
```

- Con esto, nunca se renderiza el dashboard si el usuario **no** está autenticado, ni siquiera mientras Clerk carga.
- El `useEffect` actual de redirección se puede simplificar o eliminar, ya que el render condicional cubre los casos.

### 3. Integrar `authStore.isLoading` si quieres aún más control

- Opcionalmente, combinar `useAuth` de Clerk con `useAuthStore` para usar también `isLoading` del store:
  - Mientras `!isLoaded || authStore.isLoading` → `<LoadingScreen />`.
  - Esto asegura que tampoco haya parpadeo cuando estamos resolviendo el rol B2B/B2C.

### 4. Verificación final

- Casos a probar:

  1. Usuario **no autenticado** abre `/` → debe ver **solo login**, sin flash de dashboard.
  2. Usuario **autenticado** abre `/` → debe ver directamente tabs (B2B o B2C) sin ver login.
  3. Navegar directamente a `/(auth)/login` estando autenticado → debe redirigir inmediatamente a `/(tabs)` sin mostrar formulario.
  4. Refrescar `/` y `/login` varias veces para confirmar que no hay flicker.

## Resumen

- El parpadeo se debe a que `InitialLayout` renderiza `<Slot />` mientras Clerk aún carga, y las redirecciones se hacen después en un `useEffect`.
- La solución es **condicionar el render** de `<Slot />` usando `isLoaded` + `isSignedIn` y `segments`, mostrando una `LoadingScreen` mientras tanto y usando `Redirect` para cambiar de grupo (`(auth)` ↔ `(tabs)`).
- Esto hace que la UI siempre muestre solo la vista correcta para el estado actual de autenticación, sin flashes intermedios.