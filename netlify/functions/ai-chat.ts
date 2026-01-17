/**
 * AI Chat Function
 * Endpoint principal para conversaciones con agentes de IA
 * Usa Mastra como orquestador según arquitectura documentada
 */
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

  // Inicializar agente de Mastra con tools MCP
  const agent = initializeVeterinaryAgent(token, aiContext);

  // Preparar mensajes para Mastra (convertir formato)
  const mastraMessages = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'system',
    content: msg.content,
  }));

  // Ejecutar agente con Mastra
  let responseText = '';
  const actions: any[] = [];
  const toolCalls: any[] = [];

  try {
    console.log('[AI Chat] Executing agent with Mastra...');
    
    // Obtener el último mensaje del usuario
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Los modelos de @ai-sdk/openai y @ai-sdk/anthropic son v2/v3
    // generate() funciona con modelos v2/v3/v5
    // generateLegacy() solo funciona con modelos v1
    const result = await agent.generate(lastUserMessage, {
      maxSteps: 10,
    });

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
    console.error('[AI Chat] Error executing agent:', error);
    throw new Error(`Error al ejecutar agente: ${error.message}`);
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
