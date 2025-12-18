# Análisis de Arquitectura del Proyecto

Este documento describe la arquitectura técnica de **PelusAppNative**, una aplicación móvil B2B2C construida con React Native y Expo.

## 1. Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Core** | React Native + Expo | SDK 51 | Base del desarrollo móvil multiplataforma. |
| **Lenguaje** | TypeScript | 5.1+ | Tipado estático y robustez. |
| **Navegación** | Expo Router | ~3.5 | Enrutamiento basado en archivos (File-based routing). |
| **Estilos** | NativeWind (Tailwind) | v4 | Estilizado utilitario compatible con RN. |
| **Estado** | Zustand | v4.5 | Gestión de estado global ligero y modular. |
| **Auth** | Clerk | v2.19 | Autenticación y gestión de usuarios. |

## 2. Patrón de Arquitectura

El proyecto sigue una **Arquitectura basada en características (Feature-Based Architecture)**.
El código se organiza por **dominio de negocio** en lugar de por tipo de archivo técnico.

### Estructura de Directorios

- **`/app` (Capa de Enrutamiento)**:
  - Responsabilidad única: Definir la navegación y conectar las pantallas.
  - Utiliza **Expo Router**.
  - `_layout.tsx`: Configuración global (Providers como Clerk, estilos globales).
  - Este directorio delega la lógica de negocio a los módulos en `src`.

- **`/src` (Capa de Lógica)**:
  - **`/core`**: Infraestructura base agnóstica del negocio.
    - `services/`: Clientes API, almacenamiento local (ej. `tokenCache` para Clerk).
    - `store/`: Estados globales (`authStore`, `onboardingStore`) usando Zustand.
    - `types/`: Definiciones de tipos compartidas por toda la app.
  
  - **`/features`**: Módulos funcionales aislados.
    - **`Auth`**: Pantallas y lógica de login/registro.
    - **`B2B_Dashboard`**: Lógica y vistas específicas para usuarios de negocio.
    - **`B2C_Shop`**: Lógica y vistas específicas para clientes finales.
    - **`Shared`**: Componentes reutilizables entre features (Botones, Inputs, Layouts comunes).

## 3. Flujos Clave

### Autenticación y Roles
- Se utiliza **Clerk** como proveedor de identidad. 
- La configuración está centralizada en `app/_layout.tsx`.
- Existe un manejo específico de errores de "Chunk Load" para la versión Web/PWA implementado en el layout raíz.
- La separación entre roles B2B y B2C se gestiona mediante metadatos de usuario (`user.publicMetadata.role`) y se refleja en el `authStore` de Zustand.

### Estilizado
- Se utiliza **NativeWind**, permitiendo usar clases de Tailwind CSS directamente en componentes React Native (`className="..."`).
- La configuración reside en `tailwind.config.js` y se cargan los estilos globales desde `global.css`.

### Soporte Web / PWA
- El proyecto está configurado para ejecutarse también en web (`react-native-web`).
- Incluye archivos para despliegue en **Netlify** (`netlify.toml`) y estructura para build web (`dist/`, `web-build/`).

## Recomendaciones de Desarrollo

1. **Separación de Responsabilidades**: Evita importar lógica de `B2B` dentro de `B2C` directamente; usa `Shared` o el `Store` para la comunicación entre módulos.
2. **Imports Limpios**: Utiliza los path aliases configurados en `tsconfig.json`:
   - `@/core/*`
   - `@/features/*`
   - `@/shared/*`
