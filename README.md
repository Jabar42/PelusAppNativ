# PelusAppNative - React Native con Expo

Aplicación B2B2C construida con React Native y Expo usando TypeScript, con arquitectura basada en características (feature-based).

## Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn
- Expo CLI (se instala globalmente con `npm install -g expo-cli`)

## Instalación

1. Instala las dependencias:
```bash
npm install
```

## Ejecutar la aplicación

### Desarrollo

Inicia el servidor de desarrollo de Expo:
```bash
npm start
```

Esto abrirá el Metro Bundler en tu navegador. Desde ahí puedes:
- Presionar `a` para abrir en Android
- Presionar `i` para abrir en iOS (requiere Xcode en Mac)
- Presionar `w` para abrir en navegador web
- Escanear el código QR con la app Expo Go en tu dispositivo móvil

### Scripts disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Inicia en Android
- `npm run ios` - Inicia en iOS
- `npm run web` - Inicia en navegador web
- `npm run build` - Construye la aplicación para web (PWA)

## Estructura del proyecto

```
PelusAppNative/
├── src/
│   ├── core/                    # Infraestructura compartida
│   │   ├── services/           # API clients, storage
│   │   ├── store/              # Zustand stores (authStore)
│   │   └── types/              # Tipos TypeScript compartidos
│   │
│   ├── features/                # Módulos por característica
│   │   ├── Auth/               # Autenticación
│   │   │   ├── screens/        # LoginScreen
│   │   │   └── hooks/          # useAuth
│   │   │
│   │   ├── B2B_Dashboard/      # Módulo B2B
│   │   │   ├── components/     # Componentes específicos B2B
│   │   │   └── screens/        # HomeScreen, ProfileScreen, etc.
│   │   │
│   │   ├── B2C_Shop/           # Módulo B2C
│   │   │   ├── components/     # Componentes específicos B2C
│   │   │   └── screens/        # HomeScreen, FavoritesScreen, etc.
│   │   │
│   │   └── Shared/             # Componentes transversales
│   │       └── components/     # Navigation, RoleGate, etc.
│   │
│   └── app/                     # Expo Router (solo rutas)
│       ├── _layout.tsx          # Layout raíz (ClerkProvider)
│       ├── (auth)/              # Rutas de autenticación
│       └── (tabs)/              # Rutas con tabs
│
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias del proyecto
├── tsconfig.json                # Configuración de TypeScript
└── README.md                    # Este archivo
```

## Tecnologías utilizadas

- React Native 0.74.5
- Expo SDK ~51.0.0
- Expo Router 3.5.24 (file-based routing)
- TypeScript 5.1.3
- React 18.2.0
- Clerk (Autenticación)
- Zustand (State Management)
- NativeWind 4.2.1 (Tailwind CSS para React Native)

## Características

- ✅ Arquitectura feature-based (escalable para B2B2C)
- ✅ Navegación con Expo Router (file-based routing)
- ✅ Autenticación con Clerk
- ✅ Manejo de roles B2B/B2C desde Clerk metadata
- ✅ State management con Zustand
- ✅ Navegación responsiva (móvil/desktop)
- ✅ Soporte PWA
- ✅ TypeScript con tipado estricto
- ✅ Path aliases configurados (@/core, @/features, @/shared)

## Arquitectura

El proyecto utiliza una arquitectura basada en características (feature-based) que separa claramente:

- **Core**: Infraestructura compartida (servicios, stores, tipos)
- **Features**: Módulos independientes por característica (Auth, B2B_Dashboard, B2C_Shop, Shared)
- **App**: Solo rutas de Expo Router que re-exportan desde features

### Manejo de Roles

Los roles (B2B/B2C) se obtienen desde Clerk metadata (`user.publicMetadata.role`) y se almacenan en el Zustand store. Las pantallas se renderizan dinámicamente según el rol del usuario.

### Path Aliases

El proyecto utiliza path aliases para imports más limpios:
- `@/core/*` → `src/core/*`
- `@/features/*` → `src/features/*`
- `@/shared/*` → `src/features/Shared/*`

## Documentación adicional

Para más detalles sobre la arquitectura del proyecto, consulta [ARQUITECTURA.md](./ARQUITECTURA.md).
