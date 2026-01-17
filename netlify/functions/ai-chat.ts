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
import { initializeVeterinaryAgent } from './utils/mastra-setup';

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


  // Ejecutar agente con Mastra con fallback de modelos
  let responseText = '';
  const actions: any[] = [];
  const toolCalls: any[] = [];

  // Obtener el último mensaje del usuario
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

  // Inicializar agente una sola vez (usa el modelo configurado automáticamente)
  const agent = initializeVeterinaryAgent(token, aiContext);
  
  let result: any = null;
  let generateError: any = null;
  let legacyError: any = null;

  // Intentar primero con generate() (para modelos v2/v3/v5)
  try {
    console.log('[AI Chat] Attempting with generate()...');
    result = await agent.generate(lastUserMessage, {
      maxSteps: 10,
    });
    console.log('[AI Chat] Success with generate()');
  } catch (error: any) {
    generateError = error;
    console.warn('[AI Chat] generate() failed:', error.message);
    
    // Si el error indica que es un modelo v1/v4 (no compatible con generate/stream), intentar generateLegacy()
    // Los mensajes de error de Mastra para modelos v1/v4 incluyen:
    // - "AI SDK v4 model ... not compatible with generate()"
    // - "AI SDK v4 model ... not compatible with stream()"
    // - "Please use AI SDK v5+ models or call the generateLegacy()"
    const isV1OrV4Model = 
      error.message?.includes('AI SDK v4 model') || 
      error.message?.includes('not compatible with generate()') ||
      error.message?.includes('not compatible with stream()') ||
      (error.message?.includes('Please use') && error.message?.includes('generateLegacy()'));
    
    // NO intentar generateLegacy() si el error dice que el modelo es v2/v3
    const isV2OrV3Model = 
      error.message?.includes('V2 models are not supported') ||
      error.message?.includes('V3 models are not supported') ||
      error.message?.includes('Please use generate instead');
    
    if (isV1OrV4Model && !isV2OrV3Model) {
      try {
        console.log('[AI Chat] Model appears to be v1/v4, attempting with generateLegacy()...');
        result = await agent.generateLegacy(lastUserMessage, {
          maxSteps: 10,
        });
        console.log('[AI Chat] Success with generateLegacy()');
      } catch (error2: any) {
        legacyError = error2;
        console.error('[AI Chat] generateLegacy() also failed:', error2.message);
        
        // Si generateLegacy() falla porque el modelo es v2/v3, tenemos un problema
        // El modelo es v2/v3 pero generate() también falla (probablemente bug en Mastra)
        if (error2.message?.includes('V2 models are not supported') ||
            error2.message?.includes('V3 models are not supported') ||
            error2.message?.includes('Please use generate instead')) {
          // El modelo es v2/v3, pero generate() falló. Esto es un bug conocido.
          // Lanzar error descriptivo con instrucciones claras
          const errorDetails = `Error generate(): ${generateError.message.substring(0, 200)}`;
          throw new Error(
            `⚠️ Bug conocido en Mastra: El modelo OpenAI v3 no funciona correctamente.\n\n` +
            `Solución inmediata: Cambia a otro modelo agregando una de estas líneas a tu archivo .env:\n` +
            `  AI_PROVIDER=google\n` +
            `  # O\n` +
            `  AI_PROVIDER=deepseek\n` +
            `  # O\n` +
            `  AI_PROVIDER=anthropic\n\n` +
            `Asegúrate de tener la API key correspondiente configurada.\n\n` +
            `${errorDetails}`
          );
        }
        
        // Otro tipo de error en generateLegacy()
        throw error2;
      }
    } else {
      // Si el error es sobre stream() pero el modelo es v2/v3, es un bug conocido de Mastra
      // En este caso, no podemos usar generateLegacy() porque no funciona con v2/v3
      if (error.message?.includes('not compatible with stream()') || isV2OrV3Model) {
        throw new Error(
          `El modelo actual (v2/v3) tiene un bug conocido en Mastra: generate() falla porque internamente llama a stream() que no funciona. ` +
          `Solución: Configura otro modelo usando AI_PROVIDER=google, AI_PROVIDER=deepseek, o AI_PROVIDER=anthropic en tu .env. ` +
          `Error original: ${error.message}`
        );
      }
      
      // Si no es un error de compatibilidad de versión, lanzar el error original
      throw error;
    }
  }

  // Si no hay resultado después de todos los intentos, lanzar error
  if (!result) {
    const errorMsg = legacyError 
      ? `generateLegacy(): ${legacyError.message}` 
      : generateError 
        ? `generate(): ${generateError.message}` 
        : 'Unknown error';
    throw new Error(`No se pudo ejecutar el agente. ${errorMsg}`);
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
