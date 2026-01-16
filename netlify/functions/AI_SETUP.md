# Setup de IA - Netlify Functions con Mastra

## Dependencias Requeridas

Para completar la implementación de IA, instalar:

```bash
npm install @mastra/core @mastra/anthropic @mastra/openai
```

### Opcional (para otras capacidades):
```bash
# Para caching con Upstash
npm install @upstash/redis

# Para rate limiting
npm install rate-limiter-flexible
```

## Variables de Entorno

Agregar a `.env` y Netlify Dashboard:

```env
# Proveedor de LLM principal
AI_PROVIDER=openai  # o 'anthropic', 'local'

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (ya configurado)
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Clerk (ya configurado)
CLERK_SECRET_KEY=...

# Opcional: Rate limiting
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Estructura Actual

- `ai-chat.ts` - Endpoint principal de conversación
- `ai-execute-tool.ts` - Ejecución directa de tools MCP
- `utils/auth.ts` - Middleware de autenticación y extracción de contexto
- `utils/cors.ts` - Manejo de CORS (ya existe)

## Próximos Pasos (Post-instalación)

1. **Completar integración Mastra** en `ai-chat.ts`:
   - Inicializar agente con configuración
   - Registrar tools MCP
   - Implementar flujo de conversación

2. **MCP Custom Wrapper** (TODO siguiente):
   - Crear wrapper que inyecte JWT en queries
   - Validar permisos antes de ejecutar tools

3. **Testing**:
   - Probar autenticación JWT
   - Validar RLS en queries
   - Verificar rate limiting

## Notas de Seguridad

- ✅ JWT de Clerk validado en cada request
- ✅ Contexto extraído (user_id, org_id, location_id)
- ✅ RLS de Supabase activo mediante JWT pass-through
- ⚠️ Rate limiting pendiente (Fase 4)
- ⚠️ Caching pendiente (Fase 4)
