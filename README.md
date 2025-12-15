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
├── App.tsx          # Componente principal de la aplicación
├── app.json         # Configuración de Expo
├── package.json     # Dependencias del proyecto
├── tsconfig.json    # Configuración de TypeScript
└── README.md        # Este archivo
```

## Tecnologías utilizadas

- React Native
- Expo SDK ~51.0.0
- TypeScript
- React 18.2.0

## Próximos pasos

Esta es una aplicación básica de ejemplo. Puedes expandirla agregando:
- Navegación entre pantallas
- Estado global (Context API, Redux, etc.)
- Llamadas a APIs
- Almacenamiento local
- Y mucho más...






