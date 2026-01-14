# Solución: Error "new row violates row-level security policy"

## Síntomas

Al intentar crear una organización o sede, aparece el error:
```
Error: new row violates row-level security policy for table "locations"
```

También puedes ver múltiples warnings en la consola:
```
Multiple GoTrueClient instances detected in the same browser context
```

## Causas

### 1. Template `supabase` no existe o no tiene los claims necesarios

El código busca un template llamado `supabase` en Clerk, pero puede que:
- No exista el template
- Exista pero se llame diferente (ej: `__session`)
- Exista pero no tenga los claims necesarios

### 2. El JWT no tiene los claims actualizados

Después de crear una organización, el token puede no tener `org_id` y `org_role` inmediatamente.

## Solución Paso a Paso

### Paso 1: Verificar/Crear Template `supabase` en Clerk

1. Ve a https://dashboard.clerk.com
2. Selecciona tu aplicación
3. Ve a **Configure** → **JWT Templates**
4. Busca un template llamado `supabase`
   - Si **NO existe**: Crea uno nuevo (ver Paso 2)
   - Si **existe**: Edítalo (ver Paso 3)

### Paso 2: Crear Template `supabase` (si no existe)

1. Haz clic en **New Template**
2. **Name**: `supabase` (exactamente así, en minúsculas)
3. **Token Lifetime**: 3600 segundos (1 hora)
4. Agrega estos claims:

```
user_id = {{user.id}}
org_id = {{org.id}}
org_role = {{org.role}}
user_type = {{user.public_metadata.user_type}}
active_location_id = {{org.publicMetadata.active_location_id}}
```

5. Guarda el template

### Paso 3: Verificar Claims del Template (si ya existe)

Asegúrate de que el template `supabase` tenga **todos** estos claims:

- ✅ `user_id`: `{{user.id}}`
- ✅ `org_id`: `{{org.id}}`
- ✅ `org_role`: `{{org.role}}`
- ✅ `user_type`: `{{user.public_metadata.user_type}}`
- ✅ `active_location_id`: `{{org.publicMetadata.active_location_id}}`

**Nota**: Si falta alguno, agrégalo y guarda.

### Paso 4: Configurar Service Role Key (Recomendado)

Para evitar problemas de RLS en operaciones administrativas, configura el `service_role` key:

1. Ve a Supabase Dashboard → **Settings** → **API**
2. Copia el **service_role key** (NO el anon key)
3. En Netlify Dashboard → **Site settings** → **Environment variables**
4. Agrega:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (pega el service_role key)
5. Guarda y redespliega

### Paso 5: Verificar que Funciona

1. Cierra sesión y vuelve a iniciar sesión en tu app
2. Intenta crear una organización nuevamente
3. Si el error persiste, verifica los logs de Netlify Functions

## Verificación del JWT

Para verificar que el JWT tiene los claims correctos:

1. En tu app, después de iniciar sesión, agrega esto temporalmente:
   ```typescript
   const token = await getToken({ template: 'supabase' });
   console.log('JWT Token:', token);
   ```

2. Copia el token y pégalo en https://jwt.io
3. Verifica que el payload contenga:
   - `user_id`
   - `org_id` (puede ser null si no hay org activa)
   - `org_role` (puede ser null si no hay org activa)
   - `user_type`
   - `active_location_id` (puede ser null)

## Solución Temporal

Si necesitas una solución rápida mientras configuras el template:

1. Agrega `SUPABASE_SERVICE_ROLE_KEY` a Netlify (Paso 4)
2. El backend usará el service_role key para crear la primera sede
3. Esto bypass RLS pero es seguro porque el backend valida permisos antes

## Cambios Recientes

He corregido el problema de múltiples instancias de Supabase implementando un patrón Singleton. Esto debería eliminar los warnings de "Multiple GoTrueClient instances".

## Si el Problema Persiste

1. Verifica que el template se llama exactamente `supabase` (case-sensitive)
2. Verifica que los claims usan la sintaxis correcta de Clerk:
   - `{{user.id}}` (no `{{user_id}}`)
   - `{{org.id}}` (no `{{org_id}}`)
   - `{{org.publicMetadata.active_location_id}}` (con `publicMetadata` en camelCase)
3. Verifica los logs de Netlify Functions para ver el error exacto
4. Asegúrate de que el usuario sea admin/creator de la organización
