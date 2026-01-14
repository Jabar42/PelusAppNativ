# Configuración de JWT Template en Clerk

Esta guía te ayudará a configurar el JWT Template en Clerk para que Supabase pueda aplicar las políticas RLS correctamente.

**⚠️ IMPORTANTE**: El código de PelusApp usa `getToken({ template: 'supabase' })`, por lo que necesitas un template específico llamado `supabase`. El template `__session` (por defecto) no es suficiente.

## Claims Requeridos

El sistema de sedes requiere los siguientes claims en el JWT:

| Claim | Valor | Descripción | Requerido |
|-------|-------|-------------|-----------|
| `user_id` | `{{user.id}}` | ID del usuario | ✅ Sí |
| `org_id` | `{{org.id}}` | ID de la organización activa | ✅ Sí (para B2B) |
| `org_role` | `{{org.role}}` | Rol del usuario en la organización | ✅ Sí (para B2B) |
| `user_type` | `{{user.public_metadata.user_type}}` | Tipo de usuario (pet_owner/professional) | ✅ Sí |
| `active_location_id` | `{{org.publicMetadata.active_location_id}}` | ID de la sede activa | ⚠️ Opcional (para multisede) |

## Pasos para Configurar

### 1. Acceder al Dashboard de Clerk

1. Ve a https://dashboard.clerk.com
2. Inicia sesión con tu cuenta
3. Selecciona tu aplicación (PelusApp)

### 2. Crear o Editar el JWT Template

1. En el menú lateral, ve a **Configure** → **JWT Templates**
2. Si ya existe un template llamado `supabase`, haz clic en él para editarlo
3. Si no existe, haz clic en **New Template**
4. Selecciona **Supabase** como base (o crea uno personalizado)

### 3. Configurar el Nombre

- **Name**: `supabase` (debe coincidir exactamente con el nombre usado en el código)

### 4. Agregar los Claims

En la sección **Claims**, agrega cada claim uno por uno:

#### Claim 1: user_id
- **Key**: `user_id`
- **Value**: `{{user.id}}`
- **Description**: ID del usuario de Clerk

#### Claim 2: org_id
- **Key**: `org_id`
- **Value**: `{{org.id}}`
- **Description**: ID de la organización activa (será null si no hay org activa)

#### Claim 3: org_role
- **Key**: `org_role`
- **Value**: `{{org.role}}`
- **Description**: Rol del usuario en la organización (org:admin, org:creator, org:member, etc.)

#### Claim 4: user_type
- **Key**: `user_type`
- **Value**: `{{user.public_metadata.user_type}}`
- **Description**: Tipo de usuario (pet_owner o professional)

#### Claim 5: active_location_id (Opcional pero Recomendado)
- **Key**: `active_location_id`
- **Value**: `{{org.publicMetadata.active_location_id}}`
- **Description**: ID de la sede activa (será null si no hay sede activa o no hay org)

### 5. Configuración JSON Completa (Alternativa)

Si prefieres editar el JSON directamente, aquí está la configuración completa:

```json
{
  "aud": "supabase",
  "exp": "{{date.now_plus_seconds(3600)}}",
  "iat": "{{date.now}}",
  "iss": "https://your-clerk-instance.clerk.accounts.dev",
  "nbf": "{{date.now}}",
  "sub": "{{user.id}}",
  "user_id": "{{user.id}}",
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}",
  "user_type": "{{user.public_metadata.user_type}}",
  "active_location_id": "{{org.publicMetadata.active_location_id}}"
}
```

**Nota**: Reemplaza `your-clerk-instance` con tu instancia de Clerk.

### 6. Guardar y Verificar

1. Haz clic en **Save** o **Update**
2. Verifica que todos los claims estén presentes
3. El template debería aparecer en la lista con el nombre `supabase`

## Verificación

Para verificar que los claims están funcionando:

1. En tu aplicación, después de iniciar sesión, puedes decodificar el JWT en https://jwt.io
2. Obtén el token usando:
   ```typescript
   const token = await getToken({ template: 'supabase' });
   console.log('JWT Token:', token);
   ```
3. Pega el token en jwt.io y verifica que contenga:
   - `user_id`
   - `org_id` (si hay organización activa)
   - `org_role` (si hay organización activa)
   - `user_type`
   - `active_location_id` (si hay sede activa)

## Solución de Problemas

### Error: "new row violates row-level security policy"

**Causa**: El JWT no tiene `org_id` o `org_role` cuando se intenta crear una sede.

**Solución**:
1. Verifica que el JWT Template tenga `org_id` y `org_role` configurados
2. Asegúrate de que el token se refresque después de crear la organización
3. Verifica que el usuario sea admin/creator de la organización

### El claim `active_location_id` siempre es null

**Causa**: La organización no tiene `active_location_id` en `publicMetadata`.

**Solución**:
1. Verifica que el claim esté configurado en el JWT Template
2. Asegúrate de que `update-org-metadata` esté actualizando `active_location_id`
3. Verifica que la organización tenga el metadata correcto en Clerk Dashboard

### El claim `org_id` es null cuando debería tener valor

**Causa**: No hay organización activa o el token no se refrescó.

**Solución**:
1. Verifica que `setActive({ organization: orgId })` se haya ejecutado
2. Fuerza refresh del token: `await getToken({ template: 'supabase', skipCache: true })`
3. Verifica que el usuario sea miembro de la organización en Clerk Dashboard

## Notas Importantes

1. **Sensibilidad a mayúsculas**: Los nombres de los claims son case-sensitive. Usa exactamente:
   - `org_id` (no `orgId` o `ORG_ID`)
   - `org_role` (no `orgRole`)
   - `active_location_id` (no `activeLocationId`)

2. **Valores null**: Es normal que `org_id`, `org_role` y `active_location_id` sean `null` cuando:
   - El usuario no tiene organización activa
   - El usuario está en modo B2C (personal)

3. **Actualización de tokens**: Los tokens se actualizan automáticamente cuando cambias de organización o sede, pero puedes forzar un refresh con `skipCache: true`.

4. **Testing**: Después de configurar, prueba creando una organización nueva para verificar que los claims estén presentes.
