# PelusAppNative - React Native con Expo

Aplicación multiplataforma (iOS, Android, Web) construida con React Native y Expo usando TypeScript, bajo una arquitectura de **Identidad Unificada** y **Multi-Contexto**.

## Requisitos previos

- Node.js (versión 18 o superior)
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
│   ├── core/                    # Infraestructura compartida (Inmutable)
│   │   ├── services/           # API clients, storage
│   │   ├── store/              # Zustand stores (authStore)
│   │   └── types/              # Tipos TypeScript compartidos
│   │
│   ├── features/                # Módulos por Contexto
│   │   ├── Auth/               # Autenticación y Sincronización
│   │   │
│   │   ├── User_Space/         # Espacio Personal (B2C)
│   │   │   └── screens/        # Home, Favoritos, Perfil Personal
│   │   │
│   │   ├── Business_Center/    # Orquestador Profesional (B2B)
│   │   │   ├── Veterinary/     # Módulo específico de Veterinaria
│   │   │   └── Orchestrator.tsx # Orquestador de módulos profesionales
│   │   │
│   │   └── Shared/             # UI Components & Navigation
│   │
│   └── app/                     # Expo Router (solo rutas)
│       ├── _layout.tsx          # Layout raíz (ClerkProvider)
│       ├── (auth)/              # Rutas de autenticación
│       └── (tabs)/              # Rutas con tabs (Context-Aware)
│
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias del proyecto
├── tsconfig.json                # Configuración de TypeScript
└── README.md                    # Este archivo
```

## Tecnologías principales

- React Native 0.74.5 / Expo SDK 51
- Expo Router 3.5.24 (file-based routing)
- Clerk (Autenticación y Organizaciones)
- Zustand (State Management ligero)
- Gluestack UI v2 (Design System)
- NativeWind 4.2.1 (Tailwind CSS)

## Características Clave

- ✅ **Identidad Unificada**: Todos los usuarios entran como clientes (B2C) por defecto.
- ✅ **Multi-Contexto**: Soporte para perfiles profesionales mediante Organizaciones de Clerk.
- ✅ **Módulos Plug & Play**: Arquitectura preparada para escalar a múltiples verticales (Veterinaria, Paseos, etc.).
- ✅ **Navegación Responsiva**: Sidebar para desktop y MobileMenu para móvil, sensibles al contexto activo.
- ✅ **Zero Flickering**: Manejo optimizado de estados de carga durante la inicialización de Clerk.
- ✅ **Soporte PWA**: Totalmente funcional en web como aplicación progresiva.

## Arquitectura (Identidad Unificada)

El proyecto utiliza un modelo de **Contextos Dinámicos**. La fuente de verdad ya no es un "rol" fijo en el usuario, sino la **Organización Activa** en Clerk.

- **Perfil Personal (B2C)**: Acceso a mascotas, favoritos y citas personales.
- **Espacio Profesional (B2B)**: Gestión de clínica, pacientes y recordatorios (vía Organizaciones).

El sistema permite el **Switching de Contexto** en tiempo real: un veterinario puede alternar a su "vista de dueño" con un solo click sin cerrar sesión, gracias a la gestión de membresías nativa de Clerk.

### Path Aliases

El proyecto utiliza path aliases para imports más limpios:
- `@/core/*` → `src/core/*`
- `@/features/*` → `src/features/*`
- `@/shared/*` → `src/features/Shared/*`

## Documentación adicional

Para una visión técnica profunda de la nueva arquitectura, consulta [ARQUITECTURA.md](./ARQUITECTURA.md).
Si deseas ver cómo funcionaba el sistema anterior de roles fijos, consulta [ARQUITECTURA_LEGACY_V1.md](./ARQUITECTURA_LEGACY_V1.md).
