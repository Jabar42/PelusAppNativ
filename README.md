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
├── netlify/
│   └── functions/
│       ├── webhook-clerk.ts     # Netlify Function del webhook
│       └── utils/
│           └── clerkService.ts  # Servicio para actualizar usuarios
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
├── netlify.toml                 # Configuración de Netlify
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
- ✅ Webhook automático para asignación de roles (Netlify Functions)
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

#### Webhook para Asignación Automática de Roles

La aplicación utiliza un webhook de Clerk (implementado como Netlify Function) que asigna automáticamente el rol a los usuarios cuando se registran. El webhook procesa los eventos `user.created` y `user.updated` de Clerk.

**Flujo de Asignación de Rol:**

1. El usuario selecciona un rol (B2B o B2C) en la pantalla de selección
2. El rol se guarda en `pendingRole` del store de Zustand
3. El usuario se registra o inicia sesión en Clerk
4. La app actualiza `unsafeMetadata.pendingRole` en Clerk (lo más rápido posible)
5. Clerk dispara eventos `user.created` y/o `user.updated`
6. El webhook recibe el evento, verifica la firma con `svix`, y actualiza `publicMetadata.role`
7. La app lee el rol desde `publicMetadata.role` usando `useAuthSync`

**Configuración del Webhook:**

1. **Variables de Entorno:**
   - Configura `CLERK_SECRET_KEY` y `CLERK_WEBHOOK_SECRET` en Netlify Dashboard (Settings > Environment variables)
   - Para desarrollo local, crea un archivo `.env` con estas variables:
     ```
     CLERK_SECRET_KEY=tu_secret_key_aqui
     CLERK_WEBHOOK_SECRET=tu_webhook_secret_aqui
     ```
   - **Importante**: Nunca commitees el archivo `.env` al repositorio

2. **Configurar Webhook en Clerk Dashboard:**
   - Ve a https://dashboard.clerk.com
   - Selecciona tu aplicación
   - Ve a "Webhooks" en el menú lateral
   - Crea un nuevo webhook con:
     - **Endpoint URL**: `https://tu-dominio.netlify.app/.netlify/functions/webhook-clerk`
     - **Eventos**: Selecciona `user.created` y `user.updated` (ambos son necesarios)
     - **Secret**: Copia el Webhook Secret generado y agrégalo a las variables de entorno de Netlify

3. **Testing Local:**
   - Instala Netlify CLI: `npm install -g netlify-cli`
   - Configura las variables de entorno en tu archivo `.env` local
   - Ejecuta: `netlify dev`
   - Esto expone la función en `http://localhost:8888/.netlify/functions/webhook-clerk`
   - Para testing con Clerk, usa ngrok para exponer localhost:
     - Instala ngrok: `npm install -g ngrok` o descarga desde https://ngrok.com
     - Ejecuta: `ngrok http 8888`
     - Configura el webhook temporal en Clerk con la URL de ngrok: `https://abc123.ngrok.io/.netlify/functions/webhook-clerk`

**Manejo de Race Conditions:**

El webhook está diseñado para manejar race conditions donde el evento `user.created` puede dispararse inmediatamente después del registro, antes de que la app móvil tenga tiempo de actualizar `unsafeMetadata.pendingRole`. 

**Solución implementada:**
- El webhook procesa tanto `user.created` como `user.updated`
- Si no encuentra `pendingRole` en `user.created`, retorna 200 (no error) y espera `user.updated`
- Cuando la app actualiza `unsafeMetadata`, se dispara `user.updated` y el webhook procesa el rol
- El webhook verifica que el usuario no tenga rol ya asignado antes de procesar (previene bucles infinitos)
- Es idempotente: múltiples ejecuciones con el mismo estado producen el mismo resultado

**Seguridad:**
- Verificación obligatoria de firma del webhook usando `svix`
- Variables de entorno seguras en Netlify Dashboard
- Validación de que el evento viene de Clerk antes de procesar
- Manejo de errores sin exponer información sensible

Para más detalles técnicos, consulta el código en `netlify/functions/webhook-clerk.ts` y `netlify/functions/utils/clerkService.ts`.

### Path Aliases

El proyecto utiliza path aliases para imports más limpios:
- `@/core/*` → `src/core/*`
- `@/features/*` → `src/features/*`
- `@/shared/*` → `src/features/Shared/*`

## Documentación adicional

Para más detalles sobre la arquitectura del proyecto, consulta [ARQUITECTURA.md](./ARQUITECTURA.md).
