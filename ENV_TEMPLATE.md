# Template de Variables de Entorno

Este archivo contiene un template de las variables de entorno necesarias para el proyecto.

Crea un archivo `.env` en la raíz del proyecto y copia las variables necesarias.

## Variables Requeridas

```env
# ============================================
# CLERK - Autenticación
# ============================================
# Secret Key del backend (obtener desde Clerk Dashboard > API Keys > Secret Keys)
CLERK_SECRET_KEY=sk_test_...

# Webhook Secret (opcional, solo si usas webhooks)
CLERK_WEBHOOK_SECRET=whsec_...

# ============================================
# API - Netlify Functions
# ============================================
# URL para desarrollo local (Netlify Dev usa el puerto 8888)
EXPO_PUBLIC_API_URL=http://localhost:8888/.netlify/functions

# ============================================
# SUPABASE - Base de Datos
# ============================================
# Para desarrollo local con Supabase CLI:
# 1. Ejecuta: npm run supabase:start
# 2. Copia el "anon key" del output (NO el service_role key)
# 3. Pega aquí (la URL siempre es http://localhost:54321 para local)
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Para producción (Supabase Cloud):
# EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# Service Role Key (OPCIONAL - Solo para backend/Netlify Functions)
# Se usa para operaciones administrativas donde ya validamos permisos
# NUNCA exponer en el frontend
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Cómo Obtener las Credenciales

### Clerk
1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu aplicación
3. Ve a **API Keys** > **Secret Keys**
4. Copia el `CLERK_SECRET_KEY`

### Supabase Local
1. Ejecuta `npm run supabase:start`
2. Busca en el output la línea que dice `anon key:`
3. Copia el valor completo (es un JWT largo)
4. Pega en `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. La URL siempre es `http://localhost:54321` para desarrollo local

**Importante**: 
- Usa el `anon key` (NO el `service_role key`)
- El `anon key` es seguro para el frontend
- El `service_role key` tiene permisos de admin y NUNCA debe usarse en el frontend

### Supabase Cloud (Producción)
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** > **API**
3. Copia:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Notas Importantes

- El archivo `.env` está en `.gitignore` y NO se subirá al repositorio
- Para Supabase local, las credenciales pueden cambiar si haces `supabase reset`
- Nunca compartas tu `.env` con credenciales reales
- En producción, usa variables de entorno del hosting (Netlify, Vercel, etc.)
