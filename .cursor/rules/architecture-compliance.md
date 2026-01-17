---
description: Reglas estrictas para mantener la arquitectura documentada y evitar código ad-hoc que comprometa la escalabilidad.
globs: "**/*.{ts,tsx,js,jsx}"
alwaysApply: true
---

# Reglas de Cumplimiento Arquitectónico

## 🚫 PROHIBICIONES ABSOLUTAS

### 1. IA y Orquestación de Agentes

**❌ PROHIBIDO:**
- Llamadas directas a APIs de OpenAI/Anthropic/Gemini sin usar Mastra
- Crear funciones `fetch()` o `axios()` para llamar a `https://api.openai.com/v1/chat/completions`
- Implementar lógica de function calling manualmente
- Usar `OpenAI()` o `Anthropic()` directamente en Netlify Functions
- Crear wrappers o abstracciones que bypassen Mastra

**✅ OBLIGATORIO:**
- Usar `Agent` de `@mastra/core/agent` para todos los agentes de IA
- Crear tools con `createTool` de `@mastra/core/tools`
- Inicializar agentes usando `initializeVeterinaryAgent()` de `utils/mastra-setup.ts`
- Usar `agent.generate()` o `agent.stream()` para ejecutar agentes
- Consultar `docs/AI_ARCHITECTURE.md` antes de implementar cualquier funcionalidad de IA

**Ejemplo INCORRECTO:**
```typescript
// ❌ NUNCA HACER ESTO
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({ model: 'gpt-4', messages: [...] })
});
```

**Ejemplo CORRECTO:**
```typescript
// ✅ SIEMPRE HACER ESTO
import { initializeVeterinaryAgent } from './utils/mastra-setup';
const agent = initializeVeterinaryAgent(token, aiContext);
const result = await agent.generate(userMessage);
```

### 2. MCP Tools y Acceso a Datos

**❌ PROHIBIDO:**
- Queries directas a Supabase sin pasar por MCP tools
- Crear funciones que accedan a datos sin usar `executeMCPTool()`
- Bypass del sistema de validación de permisos (`validateToolPermissions`)
- Usar el cliente de Supabase directamente en Netlify Functions sin JWT pass-through

**✅ OBLIGATORIO:**
- Crear nuevos tools en `netlify/functions/mcp-tools/`
- Usar `executeMCPTool()` para ejecutar cualquier tool MCP
- Validar permisos con `validateToolPermissions()` antes de acceder a datos
- Inyectar JWT en todas las queries de Supabase para activar RLS
- Documentar qué claims del JWT requiere cada tool

### 3. Estructura de Capas y Features

**❌ PROHIBIDO:**
- Importar desde `features/` dentro de `features/Shared/`
- Crear dependencias circulares entre features
- Mezclar lógica de diferentes contextos (B2C/B2B) en el mismo componente
- Hardcodear valores que deberían venir de configuración o metadatos

**✅ OBLIGATORIO:**
- Respetar la jerarquía de capas documentada en `ARQUITECTURA.md`
- Usar `@/` para importaciones internas
- Separar lógica por contexto (User_Space vs Business_Center)
- Consultar `docs/FEATURE_STRUCTURE.md` antes de crear nuevos archivos

### 4. Seguridad y Autenticación

**❌ PROHIBIDO:**
- Escribir en `publicMetadata` desde el frontend
- Usar `unsafeMetadata` para lógica de permisos o navegación
- Bypass de RLS usando Service Role Key en tools MCP
- Validar permisos en el frontend (solo validación visual)

**✅ OBLIGATORIO:**
- Usar Netlify Functions para modificar metadatos de Clerk
- Validar permisos en el backend con `validateToolPermissions()`
- Pasar JWT desde frontend hasta MCP tools para activar RLS
- Usar `withAIAuth` middleware en todas las Netlify Functions de IA

## 📋 CHECKLIST ANTES DE IMPLEMENTAR

Antes de escribir código, verifica:

1. **¿Requiere IA?**
   - [ ] ¿He consultado `docs/AI_ARCHITECTURE.md`?
   - [ ] ¿Estoy usando Mastra en lugar de llamadas directas?
   - [ ] ¿He creado tools MCP si necesito acceso a datos?

2. **¿Requiere acceso a datos?**
   - [ ] ¿Existe un tool MCP para esto?
   - [ ] ¿He validado permisos con `validateToolPermissions()`?
   - [ ] ¿El JWT se pasa correctamente para activar RLS?

3. **¿Requiere cambios estructurales?**
   - [ ] ¿He consultado `ARQUITECTURA.md` y `docs/FEATURE_STRUCTURE.md`?
   - [ ] ¿Respeto la jerarquía de capas?
   - [ ] ¿No estoy creando dependencias circulares?

4. **¿Requiere cambios de seguridad?**
   - [ ] ¿He consultado `docs/BACKEND_SECURITY.md`?
   - [ ] ¿Estoy usando el middleware correcto?
   - [ ] ¿No estoy exponiendo datos sensibles?

## 🔍 DETECCIÓN DE CÓDIGO AD-HOC

Si encuentras código que:
- Llama directamente a APIs de LLM sin Mastra
- Hace queries directas a Supabase sin MCP tools
- Bypassa la validación de permisos
- No sigue la estructura de capas documentada

**ACCIÓN REQUERIDA:**
1. Detener la implementación
2. Consultar la documentación relevante (`docs/AI_ARCHITECTURE.md`, `ARQUITECTURA.md`)
3. Refactorizar para seguir la arquitectura correcta
4. Si es necesario, actualizar la documentación antes de implementar

## 📚 REFERENCIAS OBLIGATORIAS

Antes de implementar cualquier funcionalidad, consulta:

- **IA y Agentes**: `docs/AI_ARCHITECTURE.md`
- **Estructura General**: `ARQUITECTURA.md`
- **Seguridad Backend**: `docs/BACKEND_SECURITY.md`
- **Estructura de Features**: `docs/FEATURE_STRUCTURE.md`
- **Decisiones**: `docs/DECISION_LOG.md`

## ⚠️ RECORDATORIO FINAL

**La arquitectura fue diseñada cuidadosamente para escalar. Los "parches" y código ad-hoc comprometen esta escalabilidad y crean deuda técnica que será difícil de mantener.**

Si no estás seguro de cómo implementar algo según la arquitectura:
1. **DETENTE**
2. Consulta la documentación
3. Pregunta antes de implementar
4. Es mejor tomar tiempo ahora que refactorizar después
