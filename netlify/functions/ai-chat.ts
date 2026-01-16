/**
 * AI Chat Function
 * Endpoint principal para conversaciones con agentes de IA
 */

import { HandlerEvent } from '@netlify/functions';
import { withAIAuth, AIContext } from './utils/auth';
import { withCors } from './utils/cors';
import { checkRateLimit } from './utils/rate-limiting';

// TODO: Importar Mastra cuando se instale
// import { Mastra, Agent } from '@mastra/core';

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

  // TODO: Fase 1 - Implementar integración con Mastra
  // Por ahora, respuesta mock para testing
  const userMessage = messages[messages.length - 1];
  
  // Detectar intención simple (mock)
  const content = userMessage.content.toLowerCase();
  let responseText = '';
  let actions = [];

  if (content.includes('navegar') || content.includes('ir a') || content.includes('llévame')) {
    responseText = 'Entendido, te llevaré a la sección que solicitaste.';
    actions.push({
      type: 'navigate',
      payload: {
        screen: '/(tabs)/',
        params: {},
      },
    });
  } else if (content.includes('historia') || content.includes('historial')) {
    responseText = 'Para consultar el historial médico, necesito saber de qué mascota. ¿Podrías darme el nombre o ID?';
  } else if (content.includes('cita') || content.includes('agendar')) {
    responseText = 'Para agendar una cita, necesitaré algunos datos: ¿Para qué mascota? ¿Qué día y hora te vendría bien?';
  } else {
    responseText = 'Hola, soy tu asistente de PelusApp. Puedo ayudarte a navegar por la app, consultar historias clínicas, agendar citas y más. ¿En qué puedo ayudarte?';
  }

  // TODO: Fase 1 - Aquí iría la lógica real de Mastra:
  /*
  const agent = await initializeAgent(aiContext);
  const response = await agent.chat({
    messages,
    context: aiContext,
  });
  
  return {
    message: {
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    },
    actions: response.actions,
    toolCalls: response.toolCalls,
  };
  */

  return {
    message: {
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
    },
    actions: actions.length > 0 ? actions : undefined,
  };
}

// Exportar handler con middleware de auth
export const handler = withAIAuth(handleAIChat);
