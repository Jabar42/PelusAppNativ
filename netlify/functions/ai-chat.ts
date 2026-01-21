/**
 * AI Chat Function
 * Endpoint principal para conversaciones con agentes de IA
 * Usa Mastra como orquestador según arquitectura documentada
 */
/// <reference types="node" />
// @ts-ignore - Los tipos están disponibles pero el linter no los encuentra desde el subdirectorio
import { HandlerEvent } from '@netlify/functions';
import { withAIAuth, AIContext } from './utils/auth';
import { withCors } from './utils/cors';
import { checkRateLimit } from './utils/rate-limiting';
import { initializeVeterinaryAgent, getAvailableModels, MODEL_FALLBACK_CHAIN } from './utils/mastra-setup';

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context: any;
  streamMode?: boolean;
}

interface ChatResponse {
  message: {
    role: 'assistant';
    content: string;
    timestamp: number;
  };
  actions?: Array<{
    type: string;
    payload: any;
  }>;
  toolCalls?: Array<{
    toolName: string;
    parameters: any;
    result?: any;
  }>;
}

/**
 * Handler principal del chat
 */
async function handleAIChat(event: HandlerEvent, aiContext: AIContext): Promise<ChatResponse> {
  const request: ChatRequest = JSON.parse(event.body || '{}');
  const { messages, context } = request;

  if (!messages || messages.length === 0) {
    throw new Error('Messages array is required');
  }

  // Verificar rate limit
  const rateLimitResult = checkRateLimit(aiContext);
  
  if (!rateLimitResult.allowed) {
    throw new Error(
      rateLimitResult.reason ||
        'Has alcanzado el límite de consultas. Intenta más tarde.'
    );
  }

  console.log('[AI Chat] Processing request for user:', aiContext.userId);
  console.log('[AI Chat] Rate limit:', {
    remaining: rateLimitResult.remaining,
    resetAt: new Date(rateLimitResult.resetAt).toLocaleString(),
  });
  console.log('[AI Chat] Context:', {
    userType: aiContext.userType,
    orgId: aiContext.orgId,
    locationId: aiContext.activeLocationId,
  });

  // Obtener token del header para pasarlo a los tools
  const token = event.headers.authorization?.replace('Bearer ', '') || '';
  if (!token) {
    throw new Error('Token de autenticación requerido');
  }


  // Ejecutar agente con Mastra con fallback automático de modelos
  let responseText = '';
  const actions: any[] = [];
  const toolCalls: any[] = [];

  // Obtener el último mensaje del usuario
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

  // Obtener modelos disponibles para fallback
  const availableModels = getAvailableModels();
  if (availableModels.length === 0) {
    throw new Error(
      'Ningún modelo de IA está configurado. Configura al menos una API key: ' +
      'OPENAI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, DEEPSEEK_API_KEY, o ANTHROPIC_API_KEY'
    );
  }

  let result: any = null;
  let lastError: any = null;
  let triedModels: string[] = [];

  // Intentar con cada modelo disponible hasta que uno funcione
  for (const modelConfig of availableModels) {
    const modelKey = `${modelConfig.provider}/${modelConfig.modelName}`;
    
    try {
      console.log(`[AI Chat] Intentando con modelo: ${modelKey}`);
      
      // Crear agente con este modelo específico
      const agent = initializeVeterinaryAgent(token, aiContext, modelConfig.createModel(modelConfig.modelName));
      
      // Intentar primero con generate() (para modelos v2/v3/v5)
      try {
        result = await agent.generate(lastUserMessage, {
          maxSteps: 10,
        });
        console.log(`[AI Chat] ✅ Éxito con ${modelKey} usando generate()`);
        break; // Salir del loop si funciona
      } catch (error: any) {
        // Si el error indica que es un modelo v1/v4, intentar generateLegacy()
        const isV1OrV4Model = 
          error.message?.includes('AI SDK v4 model') || 
          error.message?.includes('not compatible with generate()') ||
          error.message?.includes('not compatible with stream()');
        
        const isV2OrV3Model = 
          error.message?.includes('V2 models are not supported') ||
          error.message?.includes('V3 models are not supported') ||
          error.message?.includes('Please use generate instead');
        
        if (isV1OrV4Model && !isV2OrV3Model) {
          try {
            console.log(`[AI Chat] Modelo ${modelKey} parece ser v1/v4, intentando generateLegacy()...`);
            result = await agent.generateLegacy(lastUserMessage, {
              maxSteps: 10,
            });
            console.log(`[AI Chat] ✅ Éxito con ${modelKey} usando generateLegacy()`);
            break; // Salir del loop si funciona
          } catch (error2: any) {
            // generateLegacy() también falló, continuar con el siguiente modelo
            console.warn(`[AI Chat] ❌ ${modelKey} falló con generateLegacy():`, error2.message);
            lastError = error2;
            triedModels.push(`${modelKey} (generateLegacy)`);
            continue; // Intentar siguiente modelo
          }
        } else {
          // Error de compatibilidad con v2/v3 o error diferente
          console.warn(`[AI Chat] ❌ ${modelKey} falló con generate():`, error.message);
          lastError = error;
          triedModels.push(`${modelKey} (generate)`);
          
          // Si es un error de compatibilidad conocido (bug de Mastra con OpenAI v3), continuar con siguiente modelo
          if (error.message?.includes('not compatible with stream()') || isV2OrV3Model) {
            console.log(`[AI Chat] Error de compatibilidad conocido, intentando siguiente modelo...`);
            continue; // Intentar siguiente modelo
          }
          
          // Si es otro tipo de error, continuar con siguiente modelo también
          continue;
        }
      }
    } catch (error: any) {
      // Error al crear el agente o modelo
      console.warn(`[AI Chat] ❌ Error con ${modelKey}:`, error.message);
      lastError = error;
      triedModels.push(`${modelKey} (init)`);
      continue; // Intentar siguiente modelo
    }
  }

  // Si no hay resultado después de intentar todos los modelos, lanzar error descriptivo
  if (!result) {
    const triedModelsList = triedModels.length > 0 
      ? `\nModelos intentados:\n${triedModels.map(m => `  - ${m}`).join('\n')}`
      : '';
    
    const availableProviders = availableModels.map(m => m.provider).join(', ');
    
    throw new Error(
      `No se pudo ejecutar el agente con ningún modelo disponible.\n\n` +
      `Modelos disponibles: ${availableProviders}\n` +
      `Último error: ${lastError?.message || 'Desconocido'}\n` +
      triedModelsList +
      `\n\nSugerencia: Verifica que las API keys estén correctamente configuradas en tu .env`
    );
  }

  try {

    // Extraer texto de la respuesta
    responseText = result.text || 'No se pudo generar una respuesta.';

    // Extraer tool calls del resultado si están disponibles
    // result.toolCalls es un array de ToolCallChunk con estructura:
    // { type: 'tool-call', payload: { toolCallId, toolName, args, output } }
    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCallChunk of result.toolCalls) {
        const payload = toolCallChunk.payload;
        toolCalls.push({
          toolName: payload.toolName,
          parameters: payload.args,
          result: payload.output,
        });
      }
    }

    // TODO: Extraer actions del resultado si están disponibles
    // Las actions podrían estar en result.steps o en los toolResults
  } catch (error: any) {
    console.error('[AI Chat] Error processing result:', error);
    // Si ya tenemos un resultado, usarlo aunque haya error procesando tool calls
    if (result && result.text) {
      responseText = result.text;
    } else {
      throw new Error(`Error al procesar resultado del agente: ${error.message}`);
    }
  }

  return {
    message: {
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
    },
    actions: actions.length > 0 ? actions : undefined,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}

// Exportar handler con middleware de auth
export const handler = withAIAuth(handleAIChat);
