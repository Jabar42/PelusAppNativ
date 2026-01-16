# PelusAppNative - React Native con Expo

Aplicación multiplataforma (iOS, Android, Web) construida con React Native y Expo usando TypeScript, bajo una arquitectura de **Identidad Unificada**, **Multi-Contexto** y **AI-First**.

## Requisitos previos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI (se instala globalmente con `npm install -g expo-cli`)

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Consulta [ENV_TEMPLATE.md](./ENV_TEMPLATE.md) para ver todas las variables necesarias
   - **Importante**: Necesitas configurar al menos:
     - `CLERK_SECRET_KEY` (desde Clerk Dashboard)
     - `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` (ver sección Supabase Local abajo)
     - Para capacidades de IA (opcional): `AI_PROVIDER`, `OPENAI_API_KEY` o `ANTHROPIC_API_KEY`

3. Para desarrollo local con Supabase:
   ```bash
   # Asegúrate de tener Docker Desktop corriendo
   npm run supabase:start
   # Copia el "anon key" del output y pégalo en .env
   npm run supabase:migrate
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
│   │   ├── AI_Core/            # 🤖 Capacidades de IA (AI-First)
│   │   │   ├── agents/         # Configuraciones de agentes Mastra
│   │   │   ├── tools/          # Definiciones de tools MCP
│   │   │   ├── hooks/          # useAIChat, useAIActions
│   │   │   ├── components/     # AICommandBar, AIFloatingButton
│   │   │   └── services/       # aiClient (bridge a Netlify Functions)
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

### Frontend
- React Native 0.74.5 / Expo SDK 51
- Expo Router 3.5.24 (file-based routing)
- Clerk (Autenticación y Organizaciones)
- Zustand (State Management ligero)
- Gluestack UI v2 (Design System)
- NativeWind 4.2.1 (Tailwind CSS)

### Backend & IA
- Netlify Functions (Serverless)
- Mastra (Orquestación de agentes IA)
- MCP - Model Context Protocol (Puente de datos)
- Supabase (Base de datos con RLS)
- OpenAI / Anthropic (Proveedores LLM)

## Características Clave

### Arquitectura
- ✅ **Identidad Unificada**: Todos los usuarios entran como clientes (B2C) por defecto.
- ✅ **Multi-Contexto**: Soporte para perfiles profesionales mediante Organizaciones de Clerk.
- ✅ **Módulos Plug & Play**: Arquitectura preparada para escalar a múltiples verticales (Veterinaria, Paseos, etc.).
- ✅ **Navegación Responsiva**: Sidebar para desktop y MobileMenu para móvil, sensibles al contexto activo.
- ✅ **Zero Flickering**: Manejo optimizado de estados de carga durante la inicialización de Clerk.
- ✅ **Soporte PWA**: Totalmente funcional en web como aplicación progresiva.

### Capacidades de IA (AI-First) 🤖
- ✅ **AI Command Bar**: Interfaz de chat siempre accesible con botón flotante animado
- ✅ **Navegación Asistida**: Comandos naturales ("Llévame a las vacunas de Firulais")
- ✅ **Agente Veterinario**: Consulta historias clínicas, agenda citas, busca inventario
- ✅ **Seguridad Zero-Trust**: JWT pass-through hasta RLS de Supabase
- ✅ **Rate Limiting**: Control de uso por tipo de usuario (5 req/hora B2C, 100 req/día B2B)
- ✅ **Multi-Provider**: Arquitectura flexible para OpenAI, Anthropic o modelos locales

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

### Arquitectura General
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Visión técnica de la arquitectura Multi-Contexto y AI-First
- [ARQUITECTURA_LEGACY_V1.md](./ARQUITECTURA_LEGACY_V1.md) - Sistema anterior de roles fijos (referencia histórica)

### Capacidades de IA
- [docs/AI_ARCHITECTURE.md](./docs/AI_ARCHITECTURE.md) - Arquitectura completa de IA con Mastra y MCP
- [netlify/functions/AI_SETUP.md](./netlify/functions/AI_SETUP.md) - Instrucciones de instalación y setup

### Otros Documentos
- [docs/DECISION_LOG.md](./docs/DECISION_LOG.md) - Registro de decisiones arquitectónicas (ADRs)
- [docs/BACKEND_SECURITY.md](./docs/BACKEND_SECURITY.md) - Jerarquía de metadatos y seguridad
- [docs/SUPABASE_INTEGRATION.md](./docs/SUPABASE_INTEGRATION.md) - Integración con Supabase y RLS

## Desarrollo con IA

### Instalación de Dependencias de IA

Para habilitar las capacidades de IA completas:

```bash
npm install @mastra/core @mastra/anthropic @mastra/openai
```

### Configuración de Variables de Entorno

```env
# Proveedor de LLM
AI_PROVIDER=openai  # o 'anthropic'

# API Keys (elige uno o ambos)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (ya configurado)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Clerk (ya configurado)
CLERK_SECRET_KEY=...
```

### Probar el AI Command Bar

1. Inicia la aplicación: `npm start`
2. Abre en tu dispositivo o emulador
3. Toca el botón flotante de ✨ (esquina inferior derecha)
4. Prueba comandos como:
   - "Llévame al inicio"
   - "Muéstrame las vacunas de Firulais" (requiere datos de prueba)
   - "Ayúdame a navegar por la app"

### Crear Nuevos Tools MCP

Para agregar capacidades de IA para nuevas features, sigue el patrón estándar:

1. Crea el tool en `netlify/functions/mcp-tools/my-feature.ts`
2. Implementa la función con RLS activo
3. Registra en `netlify/functions/ai-execute-tool.ts`
4. Documenta permisos requeridos y comandos naturales

Ver [`docs/AI_ARCHITECTURE.md`](./docs/AI_ARCHITECTURE.md) para ejemplos completos.
