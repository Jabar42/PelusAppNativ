# Integración Supabase + Clerk (Guía Técnica)

PelusApp utiliza **Supabase** como capa de persistencia principal, integrada de forma nativa con **Clerk** para garantizar una "Identidad Unificada" y seguridad basada en **Row Level Security (RLS)**.

## 1. Arquitectura de Autenticación

No utilizamos una conexión estática con Supabase. En su lugar, el cliente se genera dinámicamente mediante un **Interceptor de Fetch**.

### El Flujo de Token:
1. La aplicación solicita datos a Supabase.
2. El **Interceptor** intercepta la petición.
3. Se solicita un JWT fresco a Clerk usando el template `supabase`.
4. El token se inyecta en el header `Authorization: Bearer <JWT>`.
5. Supabase recibe el token, lo valida y aplica las políticas **RLS** usando los claims del JWT.

## 2. Configuración en Clerk (Manual)

Para que la integración funcione, debes configurar un **JWT Template** en el Dashboard de Clerk:

1. Ve a **JWT Templates** -> **New Template** -> **Supabase**.
2. Nombre: `supabase`.
3. Claims recomendados:
   - `user_id`: `{{user.id}}`
   - `org_id`: `{{org.id}}`
   - `org_role`: `{{org.role}}`
   - `user_type`: `{{user.public_metadata.user_type}}`
   - `active_location_id`: `{{org.publicMetadata.active_location_id}}` (Opcional - para sistema de sedes)

## 3. Uso en el Frontend (React Native / Expo)

Utiliza siempre el hook `useSupabaseClient` para interactuar con la base de datos.

```tsx
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';

const MyComponent = () => {
  const supabase = useSupabaseClient();
  
  const fetchPets = async () => {
    const { data, error } = await supabase.from('pets').select('*');
    // ...
  };
}
```

## 4. Políticas RLS (Seguridad en la DB)

Todas las tablas deben tener RLS habilitado. Las políticas se basan en los claims de Clerk:

- **Acceso B2C (Personal)**: Se usa `auth.uid()` que Supabase mapea automáticamente del claim `sub` de Clerk.
- **Acceso B2B (Profesional)**: Se usa `auth.jwt() ->> 'org_id'` para filtrar datos por organización.
- **Acceso por Sede (Multisede)**: Se usa `auth.jwt() ->> 'active_location_id'` para filtrar datos por sede activa.

### 4.1 RLS Dinámico para Tablas de Negocio

Cuando una tabla de negocio (ej: `medical_histories`, `appointments`) incluye `location_id`, las políticas RLS deben ser dinámicas:

```sql
-- Ejemplo: Política que filtra por sede activa
CREATE POLICY "Staff can view records of their active location"
ON public.medical_histories
FOR SELECT
USING (
  -- Si hay location_id en JWT, filtrar por esa sede
  (
    (auth.jwt() ->> 'active_location_id') IS NOT NULL
    AND location_id = (auth.jwt() ->> 'active_location_id')::uuid
  )
  OR
  -- Admins ven todas las sedes de su org
  (
    (auth.jwt() ->> 'org_role') IN ('org:admin', 'org:creator')
    AND EXISTS (
      SELECT 1 FROM public.locations 
      WHERE id = medical_histories.location_id 
      AND org_id = (auth.jwt() ->> 'org_id')
    )
  )
);
```

**Patrón para nuevas tablas de negocio:**
1. Agregar columna `location_id uuid REFERENCES locations(id)`
2. Crear políticas RLS que respeten `active_location_id` del JWT
3. Admins siempre ven todas las sedes de su org
4. Staff ve solo su sede activa

## 5. Sistema de Sedes (Locations)

PelusApp soporta organizaciones con múltiples sedes. El sistema utiliza el "Modelo Diamante" donde un usuario puede trabajar en múltiples sedes con roles diferentes.

### 5.1 Estructura de Datos

- **`locations`**: Tabla que almacena las sedes de cada organización
- **`user_location_assignments`**: Tabla que relaciona usuarios con sedes (Modelo Diamante)

### 5.2 Flujo de Sede Activa

1. El usuario selecciona una sede en `WorkspaceManager`
2. Se actualiza `org.publicMetadata.active_location_id` mediante Netlify Function
3. Clerk detecta el cambio y refresca el token automáticamente
4. El interceptor de Supabase usa el nuevo token con `active_location_id`
5. Las políticas RLS filtran datos por `active_location_id`

### 5.3 Refresh de Tokens

Cuando se cambia la sede activa, es importante forzar el refresh del token:

```tsx
await getToken({ template: 'supabase', skipCache: true });
```

Esto asegura que el nuevo `location_id` esté disponible inmediatamente en el JWT.

## 6. Reglas de Oro
1. **Nunca** uses `supabase.auth.signInWithPassword` u otros métodos de auth de Supabase. Clerk es el único dueño de la sesión.
2. **Nunca** guardes tokens en variables globales. El hook `useSupabaseClient` se encarga del refresco.
3. **Siempre** habilita RLS en nuevas tablas. Una tabla sin RLS es un agujero de seguridad.
4. **Siempre** incluye `location_id` en tablas de negocio cuando aplique al contexto multisede.
5. **Siempre** usa políticas RLS dinámicas que respeten `active_location_id` cuando exista.





