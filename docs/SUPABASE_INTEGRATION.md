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

## 5. Reglas de Oro
1. **Nunca** uses `supabase.auth.signInWithPassword` u otros métodos de auth de Supabase. Clerk es el único dueño de la sesión.
2. **Nunca** guardes tokens en variables globales. El hook `useSupabaseClient` se encarga del refresco.
3. **Siempre** habilita RLS en nuevas tablas. Una tabla sin RLS es un agujero de seguridad.





