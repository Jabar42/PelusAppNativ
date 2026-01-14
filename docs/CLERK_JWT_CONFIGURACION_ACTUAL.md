# Configuración de JWT Template para Supabase - Guía Específica

## Situación Actual

Tienes configurado el template `__session` con estos claims:
```json
{
  "role": "authenticated",
  "org_plan": "{{org.public_metadata.plan}}",
  "org_slug": "{{org.slug}}",
  "org_type": "{{org.public_metadata.type}}",
  "user_type": "{{user.public_metadata.user_type}}",
  "onboarding_status": "{{user.public_metadata.hasCompletedOnboarding}}"
}
```

## Problema

El código de PelusApp usa `getToken({ template: 'supabase' })`, que busca un template específico llamado `supabase`. El template `__session` no tiene los claims necesarios para que las políticas RLS de Supabase funcionen.

## Solución: Crear Template `supabase`

Necesitas crear un **NUEVO** template llamado `supabase` (puedes mantener `__session` para otros usos).

### Pasos en Clerk Dashboard

1. Ve a **Configure** → **JWT Templates**
2. Haz clic en **New Template**
3. **Name**: `supabase` (exactamente así, en minúsculas)
4. **Token Lifetime**: 3600 segundos (1 hora) - o el que prefieras

### Claims para el Template `supabase`

Agrega estos claims (puedes combinar con los que ya tienes si quieres):

#### Claims Requeridos para RLS:

```json
{
  "user_id": "{{user.id}}",
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}",
  "user_type": "{{user.public_metadata.user_type}}",
  "active_location_id": "{{org.publicMetadata.active_location_id}}"
}
```

#### Claims Opcionales (puedes agregar los que ya tienes):

```json
{
  "org_type": "{{org.public_metadata.type}}",
  "org_plan": "{{org.public_metadata.plan}}",
  "org_slug": "{{org.slug}}",
  "onboarding_status": "{{user.public_metadata.hasCompletedOnboarding}}"
}
```

### Configuración Completa Recomendada

Si quieres incluir todos los claims (los que ya tienes + los nuevos):

```json
{
  "user_id": "{{user.id}}",
  "org_id": "{{org.id}}",
  "org_role": "{{org.role}}",
  "user_type": "{{user.public_metadata.user_type}}",
  "active_location_id": "{{org.publicMetadata.active_location_id}}",
  "org_type": "{{org.public_metadata.type}}",
  "org_plan": "{{org.public_metadata.plan}}",
  "org_slug": "{{org.slug}}",
  "onboarding_status": "{{user.public_metadata.hasCompletedOnboarding}}"
}
```

## Diferencias Clave

| Claim | ¿Por qué es necesario? |
|-------|------------------------|
| `user_id` | Mapeado a `auth.uid()` en Supabase para políticas B2C |
| `org_id` | Requerido por políticas RLS para filtrar por organización |
| `org_role` | Requerido para verificar si el usuario es admin (necesario para crear sedes) |
| `active_location_id` | Requerido para filtrar datos por sede activa (sistema multisede) |
| `user_type` | Ya lo tienes ✅ |
| `org_type` | Ya lo tienes ✅ (útil pero no crítico para RLS) |

## Verificación

Después de crear el template:

1. En tu app, obtén un token:
   ```typescript
   const token = await getToken({ template: 'supabase' });
   ```

2. Decodifica el token en https://jwt.io

3. Verifica que contenga:
   - ✅ `user_id`
   - ✅ `org_id` (si hay org activa)
   - ✅ `org_role` (si hay org activa)
   - ✅ `user_type`
   - ✅ `active_location_id` (puede ser null si no hay sede activa)

## Nota sobre `__session`

El template `__session` es el template por defecto de Clerk. Puedes mantenerlo para otros usos, pero el código de PelusApp específicamente busca el template `supabase` para las peticiones a Supabase.
