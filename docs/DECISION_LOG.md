# Registro de Decisiones de Arquitectura (ADR) - PelusApp

Este documento registra las decisiones críticas de arquitectura, su contexto y sus consecuencias.

## ADR 001: Identidad Unificada y Multi-Contexto (B2B2C)
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Originalmente la app separaba usuarios en roles rígidos (B2C o B2B) desde el login. Esto causaba fricción y problemas para usuarios híbridos (ej. un veterinario con mascota propia).

### Decisión
Migrar a una arquitectura de **Identidad Unificada** basada en Clerk Organizations.
- Todo usuario inicia como B2C.
- La creación de una organización "activa" el contexto B2B.
- El cambio de contexto es dinámico y no requiere re-autenticación.

### Consecuencias
- **Positivas**: Reducción de fricción, soporte nativo para usuarios híbridos, escalabilidad horizontal para nuevos negocios.
- **Negativas**: Mayor complejidad en el orquestador de navegación y lógica de carga.

---

## ADR 002: Jerarquía de Metadatos Segura (Backend-Driven)
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Clerk permite actualizar `publicMetadata` desde el frontend, pero esto es inseguro para lógica de permisos (roles/tipos). El error `public_metadata is not a valid parameter` confirmó que Clerk restringe esto por seguridad.

### Decisión
Implementar un flujo **Backend-First** para metadatos críticos.
- El frontend llama a Netlify Functions enviando un JWT de Clerk.
- El backend valida el JWT y usa el Admin SDK para actualizar `publicMetadata`.
- Se prohíbe el uso de `unsafeMetadata` para lógica de negocio.

### Consecuencias
- **Positivas**: Integridad total de los datos de identidad, seguridad contra manipulación en cliente.
- **Negativas**: Necesidad de gestionar estados de carga adicionales mientras el backend procesa la actualización.

---

## ADR 003: Sistema de Temas Dinámico vs Modo Oscuro Nativo
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Se requiere diferenciar visualmente cuando el usuario está en modo "Personal" (B2C) vs "Profesional" (B2B).

### Decisión
Utilizar un sistema de temas basado en Gluestack UI donde el color primario cambia según el contexto (ej. Cyan para B2C, Azul/Profesional para B2B).
- Se prioriza la **Conciencia de Contexto** sobre el modo oscuro nativo del sistema operativo en esta fase.

### Consecuencias
- **Positivas**: El usuario siempre sabe en qué "espacio" está operando.
- **Negativas**: La implementación del modo oscuro estándar de Android/iOS se posterga.

---

## ADR 004: Integración Supabase + Clerk mediante Interceptor de Fetch
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Necesitamos integrar Supabase con Clerk para que las políticas RLS funcionen correctamente. Supabase requiere un JWT válido en cada petición, pero Clerk maneja la autenticación de forma separada.

### Decisión
Implementar un **Interceptor de Fetch** personalizado en el cliente de Supabase que:
- Intercepta cada petición a Supabase antes de ejecutarse
- Solicita un JWT fresco de Clerk usando el template `supabase`
- Inyecta el token en el header `Authorization: Bearer <JWT>`
- Permite que Supabase valide el token y aplique RLS basado en los claims

### Consecuencias
- **Positivas**: 
  - Zero-Trust: Cada petición tiene un token fresco, evitando problemas de expiración
  - No requiere backend intermediario para cada consulta
  - RLS funciona automáticamente basado en los claims del JWT
- **Negativas**: 
  - Overhead mínimo por la solicitud de token en cada petición (mitigado por cache de Clerk)
  - Dependencia del template JWT de Clerk configurado correctamente

---

## ADR 005: Sistema de Sedes Multisede - Modelo Diamante
**Estado: Aceptado**
**Fecha: Enero 2025**

### Contexto
La aplicación originalmente estaba diseñada para una sola veterinaria. Para escalar a una plataforma SaaS, necesitamos soportar organizaciones con múltiples ubicaciones (sedes). Un veterinario puede necesitar trabajar en diferentes sedes con diferentes roles.

### Decisión
Implementar el **"Modelo Diamante"** de asignación usuario-sede:
- Tabla `locations`: Almacena las sedes de cada organización
- Tabla `user_location_assignments`: Relación muchos-a-muchos entre usuarios y sedes
- Un usuario puede tener múltiples asignaciones activas a diferentes sedes
- Cada asignación tiene un rol específico (admin, manager, staff, viewer)
- El contexto activo se gestiona mediante `active_location_id` en `org.publicMetadata`
- Las políticas RLS filtran dinámicamente por `active_location_id` del JWT

**Alternativas consideradas**:
- Poner `location_id` directamente en el perfil del usuario: ❌ Limitaría a una sola sede
- Usar solo `org_id` sin granularidad de sede: ❌ No permitiría multisede

### Consecuencias
- **Positivas**: 
  - Transforma la app de "una veterinaria" a "plataforma SaaS multisede"
  - Máxima flexibilidad: veterinario puede cubrir turnos en múltiples sedes
  - Escalabilidad: fácil agregar nuevas sedes sin reestructurar datos
  - Seguridad: RLS filtra por sede activa, pero la BD sabe que el usuario tiene acceso a múltiples
- **Negativas**: 
  - Mayor complejidad en las políticas RLS (deben ser dinámicas)
  - Necesidad de gestionar el contexto de sede activa en la UI
  - Requiere trigger de validación para prevenir eliminación de sedes con registros asociados

---

## ADR 006: Supabase CLI para Desarrollo Local
**Estado: Aceptado**
**Fecha: Enero 2025**

### Contexto
Necesitamos un entorno de desarrollo local para trabajar con Supabase sin afectar la base de datos de producción. Las migraciones deben ser versionadas y aplicables tanto en local como en producción.

### Decisión
Adoptar **Supabase CLI** como herramienta oficial para desarrollo local:
- Migraciones versionadas en `supabase/migrations/`
- Comandos npm scripts para gestionar el entorno local
- Mismas migraciones funcionan en local y producción (garantía de compatibilidad)
- Dashboard local para inspección y testing

**Alternativas consideradas**:
- Usar solo Supabase Cloud: ❌ Costos, latencia, riesgo de afectar producción
- Docker manual: ❌ Más complejo de configurar y mantener

### Consecuencias
- **Positivas**: 
  - Desarrollo sin costos ni latencia
  - Testing rápido de migraciones sin miedo a romper producción
  - Reset fácil de la base de datos para testing
  - Migraciones versionadas en Git
  - Desarrollo offline posible
- **Negativas**: 
  - Requiere Docker Desktop instalado y corriendo
  - Configuración inicial adicional

---

## ADR 007: RLS Dinámico para Tablas de Negocio
**Estado: Aceptado**
**Fecha: Enero 2025**

### Contexto
Con el sistema de sedes, las tablas de negocio (ej: `medical_histories`, `appointments`) necesitan filtrar datos por sede activa. Los staff deben ver solo su sede, pero los admins deben ver todas las sedes de su organización.

### Decisión
Implementar **Políticas RLS Dinámicas** que:
- Verifican si existe `active_location_id` en el JWT
- Si existe: filtran por esa sede específica (para staff)
- Si no existe o es admin: muestran todas las sedes de la organización
- Todas las tablas de negocio futuras deben incluir `location_id` y seguir este patrón

**Patrón estándar**:
```sql
CREATE POLICY "Staff can view records of their active location"
ON medical_histories FOR SELECT
USING (
  (active_location_id en JWT) → filtrar por esa sede
  OR
  (es admin) → ver todas las sedes de la org
);
```

### Consecuencias
- **Positivas**: 
  - Seguridad granular: cada usuario ve solo lo que debe ver
  - Flexibilidad: admins tienen visión completa, staff visión limitada
  - Escalable: patrón claro para nuevas tablas
- **Negativas**: 
  - Políticas RLS más complejas de escribir y mantener
  - Requiere documentación clara del patrón para desarrolladores

---

## ADR 008: Estructura de Features con Barrera de Capas
**Estado: Aceptado**
**Fecha: Diciembre 2025**

### Contexto
Necesitamos mantener el código desacoplado y escalable. Las features deben ser independientes para permitir desarrollo paralelo y evitar dependencias circulares.

### Decisión
Implementar una **Barrera de Capas** estricta:
- `core/`: Infraestructura inmutable (services, hooks, types)
- `features/`: Módulos de negocio independientes (Auth, User_Space, Business_Center)
- `Shared/`: Componentes UI genéricos que NO conocen features
- **Regla crítica**: `Shared/` NUNCA puede importar de `features/`
- **Path Aliases**: Usar siempre `@/` para imports limpios

### Consecuencias
- **Positivas**: 
  - Desacoplamiento total entre features
  - Desarrollo paralelo sin conflictos
  - Fácil agregar nuevas features sin afectar existentes
  - Componentes Shared reutilizables sin dependencias
- **Negativas**: 
  - Requiere disciplina del equipo para mantener las reglas
  - Algunas duplicaciones menores de código entre features
  - Comunicación entre features debe pasar por `core/` o `Shared/`

---

## ADR 009: Migración de auth.uid() a auth.jwt() ->> 'user_id' y Tipos de Columna
**Estado: Aceptado**
**Fecha: Enero 2025**

### Contexto
Clerk utiliza IDs de usuario de tipo `text` (ej: `"user_351tu1j6Vvu5qkF83bJ2fcFljQe"`), no UUIDs. Las políticas RLS que usaban `auth.uid()` intentaban castear estos IDs a UUID, causando el error `22P02: invalid input syntax for type uuid`. Además, algunas columnas en la base de datos estaban definidas como `uuid` cuando deberían ser `text` para coincidir con los IDs de Clerk.

### Decisión
Migrar completamente de `auth.uid()` a `auth.jwt() ->> 'user_id'` en todas las políticas RLS y cambiar los tipos de columna de `uuid` a `text` para IDs de usuario.

**Cambios aplicados:**
1. **Políticas RLS**: Reemplazadas todas las referencias a `auth.uid()` por `auth.jwt() ->> 'user_id'`
   - `pets`: Policy "Owners can manage their pets"
   - `profiles`: Policies "Users can view their own profile" y "Users can update their own profile"
   - `user_location_assignments`: Policy "Users can view relevant assignments"
2. **Tipos de columna**: Cambiados de `uuid` a `text`
   - `pets.owner_id`: `uuid` → `text`
   - `user_location_assignments.user_id`: Ya era `text` (correcto)

**Alternativas consideradas:**
- Mantener `auth.uid()` y convertir IDs de Clerk a UUID: ❌ Requeriría lógica compleja y pérdida de información
- Usar un campo separado `clerk_user_id text` además de `id uuid`: ❌ Duplicación innecesaria
- Mantener tipos `uuid` y convertir en el frontend: ❌ No resuelve el problema en RLS

### Consecuencias
- **Positivas**: 
  - Eliminación completa del error `22P02`
  - Alineación directa entre tipos de datos de Clerk y Supabase
  - Políticas RLS más simples y directas
  - Compatibilidad total con el formato de IDs de Clerk
- **Negativas**: 
  - Requiere migración de datos existentes (si los hay)
  - Cambio en todas las políticas RLS existentes
  - Documentación debe actualizarse para reflejar el nuevo patrón

**Regla para desarrolladores futuros:**
- ✅ **SIEMPRE** usar `auth.jwt() ->> 'user_id'` en políticas RLS para acceso B2C
- ✅ **SIEMPRE** usar tipo `text` para columnas que almacenan IDs de Clerk
- ❌ **NUNCA** usar `auth.uid()` en políticas RLS cuando se integra con Clerk
- ❌ **NUNCA** usar tipo `uuid` para IDs de usuario de Clerk

---






