# PelusAppNative - React Native con Expo

Aplicación de ejemplo "Hola Mundo" construida con React Native y Expo usando TypeScript.

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

## Estructura del proyecto

```
PelusAppNative/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx        # Layout raíz con ClerkProvider
│   ├── (auth)/            # Grupo de rutas de autenticación
│   │   └── login.tsx      # Pantalla de login
│   ├── (tabs)/            # Grupo de rutas con tabs
│   │   ├── _layout.tsx    # Layout de tabs
│   │   ├── index.tsx      # Home
│   │   ├── fav.tsx        # Favoritos
│   │   ├── pro.tsx        # Perfil
│   │   ├── settings.tsx   # Configuración
│   │   └── help.tsx       # Ayuda
│   └── utils/
│       └── cache.ts       # Token cache para Clerk
├── components/            # Componentes reutilizables
│   ├── MobileMenu.tsx     # Menú móvil (bottom bar)
│   ├── Sidebar.tsx        # Sidebar para desktop
│   ├── ResponsiveNavigation.tsx  # Wrapper responsivo
│   ├── TabsLayoutWrapper.tsx     # Layout wrapper principal
│   └── InstallPWAButton.tsx     # Botón PWA
├── app.json               # Configuración de Expo
├── package.json           # Dependencias del proyecto
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Este archivo
```

## Tecnologías utilizadas

- React Native 0.74.5
- Expo SDK ~51.0.0
- Expo Router 3.5.24 (file-based routing)
- TypeScript 5.1.3
- React 18.2.0
- Clerk (Autenticación)
- NativeWind 4.2.1 (Tailwind CSS para React Native)

## Características

- ✅ Navegación con Expo Router (file-based routing)
- ✅ Autenticación con Clerk
- ✅ Navegación responsiva (móvil/desktop)
- ✅ Soporte PWA
- ✅ TypeScript con tipado estricto

## Documentación adicional

Para más detalles sobre la arquitectura del proyecto, consulta [ARQUITECTURA.md](./ARQUITECTURA.md).






