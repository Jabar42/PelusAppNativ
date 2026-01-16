/**
 * AI Client Service
 * Cliente que comunica el frontend con las Netlify Functions de IA
 */

import { apiClient } from '@/core/services/api';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIContext {
  userId: string;
  orgId?: string;
  activeLocationId?: string;
  userType: 'pet_owner' | 'professional';
}

export interface AIChatRequest {
  messages: AIMessage[];
  context: AIContext;
  streamMode?: boolean;
}

export interface AIChatResponse {
  message: AIMessage;
  actions?: AIAction[];
  toolCalls?: AIToolCall[];
}

export interface AIAction {
  type: 'navigate' | 'update_state' | 'show_notification';
  payload: any;
}

export interface AIToolCall {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
}

/**
 * Envía un mensaje al agente de IA y obtiene una respuesta
 */
export async function sendAIMessage(
  request: AIChatRequest,
  token: string
): Promise<AIChatResponse> {
  const response = await apiClient.post<AIChatResponse>('/ai-chat', request, token);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data!;
}

/**
 * Ejecuta un tool MCP directamente
 */
export async function executeAITool(
  toolName: string,
  parameters: Record<string, any>,
  context: AIContext,
  token: string
): Promise<any> {
  const response = await apiClient.post('/ai-execute-tool', {
    toolName,
    parameters,
    context,
  }, token);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Cliente para streaming de respuestas (Fase 2)
 */
export async function* streamAIResponse(
  request: AIChatRequest
): AsyncGenerator<string, void, unknown> {
  // TODO: Implementar streaming en Fase 2
  yield 'Streaming not implemented yet';
}
