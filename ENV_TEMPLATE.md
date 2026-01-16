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

# ============================================
# IA - Capacidades AI-First (OPCIONAL)
# ============================================
# Proveedor de LLM principal (openai, anthropic, o local)
AI_PROVIDER=openai

# API Keys - Solo necesitas configurar el proveedor que uses
# OpenAI (GPT-4, GPT-4-turbo)
OPENAI_API_KEY=sk-...

# Anthropic (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting con Upstash Redis (OPCIONAL - Fase 4)
# Por ahora el rate limiting es en memoria
# UPSTASH_REDIS_REST_URL=https://...
# UPSTASH_REDIS_REST_TOKEN=...
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

### Capacidades de IA (Opcional)

Las capacidades de IA son **completamente opcionales**. La app funciona sin ellas, pero no tendrás acceso al AI Command Bar ni a los agentes.

Para habilitar IA:

1. **Elige un proveedor LLM**:
   - OpenAI (GPT-4): Mejor para tareas complejas, costo medio-alto
   - Anthropic (Claude): Excelente para contextos largos, costo medio

2. **Obtén tu API Key**:
   - **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - **Anthropic**: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)

3. **Configura las variables**:
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-...
   ```

4. **Instala dependencias de Mastra**:
   ```bash
   npm install @mastra/core @mastra/anthropic @mastra/openai
   ```

**Rate Limiting**: Por defecto usa memoria (desarrollo). Para producción, considera Upstash Redis.

**Costo Estimado**:
- B2C (5 consultas/hora): ~$0.50-1.00/usuario/mes
- B2B (100 consultas/día): ~$10-20/organización/mes

## Notas Importantes

- El archivo `.env` está en `.gitignore` y NO se subirá al repositorio
- Para Supabase local, las credenciales pueden cambiar si haces `supabase reset`
- Nunca compartas tu `.env` con credenciales reales (especialmente API keys de LLM)
- En producción, usa variables de entorno del hosting (Netlify, Vercel, etc.)
- Las API keys de LLM tienen costo por uso - monitorea tu consumo regularmente
