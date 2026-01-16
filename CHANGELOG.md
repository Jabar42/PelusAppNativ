# Changelog - PelusApp

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [3.0.0] - 2026-01-16

### 🚀 Añadido - Arquitectura AI-First

#### Capacidades de IA
- **AI Command Bar**: Interfaz de chat con agente de IA accesible mediante botón flotante animado
- **Agente Veterinario**: Consulta historias clínicas, agenda citas, busca en inventario
- **Navegación Asistida**: Comandos de lenguaje natural para moverse por la app
- **Sistema de AI Actions**: Acciones diferidas (navegación, notificaciones, actualizaciones de estado)
- **Rate Limiting**: Control de uso por tipo de usuario (5 req/hora B2C, 100 req/día B2B)

#### Backend AI Infrastructure
- **Netlify Functions**:
  - `ai-chat.ts`: Endpoint principal de conversación con agentes
  - `ai-execute-tool.ts`: Ejecución directa de tools MCP con validación
  - `utils/auth.ts`: Middleware de autenticación JWT con extracción de contexto
  - `utils/rate-limiting.ts`: Sistema de rate limiting en memoria (migrable a Redis)

#### MCP Tools Implementados
- `get_medical_history`: Consulta historias clínicas con RLS activo
- `summarize_medical_history`: Resume historial médico (mock, pendiente LLM)
- `schedule_appointment`: Agenda citas verificando conflictos
- `get_available_slots`: Consulta slots disponibles
- `navigate_to_route`: Navegación básica a pantallas
- `find_pet_and_navigate`: Búsqueda + navegación combinada
- `navigate_to_medical_history`: Navegación específica a historiales

#### Frontend AI Components
- **Feature `AI_Core/`** completa:
  - `agents/`: Configuraciones de agentes (veterinaryAgent, navigationAgent)
  - `tools/`: Definiciones y schemas de tools MCP
  - `hooks/`: `useAIChat`, `useAIActions` para comunicación y ejecución
  - `components/`: `AICommandBar`, `AIFloatingButton` con animaciones
  - `services/`: `aiClient` para comunicación con backend

#### Estado Global AI
- **aiStore (Zustand)**: Estado de conversaciones, command bar, acciones pendientes
- Persistencia de mensajes en AsyncStorage (últimos 50)
- Sistema de limpieza automática

### 📝 Actualizado

#### Documentación
- **ADR 010** agregado a `DECISION_LOG.md`: Decisión arquitectónica completa de AI-First
- `ARQUITECTURA.md`: Actualizado a versión 3.0 con sección de capacidades de IA
- `README.md`: Sección completa de desarrollo con IA y setup
- `docs/AI_ARCHITECTURE.md`: Documentación técnica exhaustiva (diagramas, decisiones, ejemplos)
- `.cursorrules`: 3 nuevas reglas (AI-First Development, AI Actions, Seguridad Zero-Trust en IA)

#### Navegación
- `TabsLayoutWrapper`: Integración de `AIFloatingButton` y `AICommandBar`
- Nueva ruta `/locations-management` para gestión de sedes

#### Componentes Compartidos
- **Gluestack Icon Fix**: Todos los componentes migrados de `Icon` wrapper a `Ionicons` directo
  - `EmptyState`, `InfoCard`, `SectionHeader`, `LoadingScreen`
  - Uso de `useToken` para tamaños y colores dinámicos
- **Input/FormField**: Soporte mejorado para `keyboardType` (email, numeric)
- **SelectField**: Validación visual de errores con `sx` styling
- **Button**: Soporte para prop `action` explícito
- **LoadingSkeleton**: Props correctamente tipadas con `ComponentProps<typeof Box>`

#### Seguridad
- **Permisos de Sedes**: Corrección de validación de roles de Clerk (`org:admin`, `org:creator`)
  - `SettingsScreen.tsx`: Menu item "Gestión de Sedes" condicionado
  - `LocationsManagementScreen.tsx`: Pantalla completa protegida por permisos
- **useOrganizationList**: Uso correcto con `{ userMemberships: true }` para obtener roles

### 🔧 Corregido

- **Type Errors**: Resueltos 30+ errores de TypeScript en componentes Gluestack
  - Props `size` de Icon incompatibles con tokens (`"$xl"` → numeric)
  - Props `type` de InputField (`"date"` → `"text"` + `keyboardType`)
  - Props `isInvalid` de SelectTrigger (reemplazado con `sx` styling)
- **Imports Unused**: Limpieza de imports no utilizados
  - `userLoaded`, `SafeAreaView`, `Dimensions`, `HStack`, `primaryBg`
- **Navigation Import Fix**: `LoadingScreen` corregido a `@/shared/components/LoadingScreen`

### 🗑️ Eliminado

- Ningún archivo eliminado en esta versión (solo migraciones de código)

### 🔒 Seguridad

- **JWT Pass-Through**: Implementado end-to-end desde frontend hasta RLS de Supabase
- **MCP Wrapper Custom**: Validación de permisos pre-ejecución con `validateToolPermissions`
- **Audit Logging**: Función `logToolExecution` para monitoreo de uso de tools
- **Rate Limiting**: Prevención de abuso con límites por usuario/organización
- **Zero Service Role Key Exposure**: RLS siempre activo, sin bypass en tools MCP

### 📦 Dependencias Pendientes (para Fase 2)

```bash
npm install @mastra/core @mastra/anthropic @mastra/openai
```

### ⚠️ Breaking Changes

- **Ninguno**: Esta versión es completamente retrocompatible
- Las capacidades de IA son opt-in (requieren configuración de API keys)

### 📋 Próximos Pasos (Fase 2)

- [ ] Instalar dependencias de Mastra
- [ ] Configurar provider LLM (OpenAI/Anthropic)
- [ ] Reemplazar respuestas mock con agentes reales
- [ ] Implementar streaming de respuestas
- [ ] Optimizar prompts para reducir tokens
- [ ] Agregar tool `search_inventory` (pendiente tabla)
- [ ] Testing exhaustivo de RLS en todos los tools
- [ ] Monitoreo de costos y métricas de uso

---

## [2.4.0] - 2026-01-15

### Añadido
- Sistema de sedes multisede (Modelo Diamante)
- Gestión de ubicaciones por organización
- RLS dinámico para tablas de negocio
- Migración de `auth.uid()` a `auth.jwt() ->> 'user_id'`

### Corregido
- Error `22P02: invalid input syntax for type uuid` en RLS
- Tipos de columna `uuid` → `text` para IDs de Clerk

---

## [2.0.0] - 2025-12-20

### Añadido
- Arquitectura de Identidad Unificada (B2B2C)
- Integración completa con Clerk Organizations
- Sistema de contextos dinámicos (B2C ↔ B2B)
- Supabase + Clerk mediante interceptor de fetch

### Cambiado
- Migración de roles fijos a organizaciones
- Jerarquía de metadatos backend-first

---

## [1.0.0] - 2025-11-01

### Inicial
- Aplicación base con React Native + Expo
- Autenticación con Clerk
- UI con Gluestack
- Gestión básica de mascotas
