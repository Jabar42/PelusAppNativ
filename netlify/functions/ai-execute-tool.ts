/**
 * AI Execute Tool Function
 * Ejecuta tools MCP individuales con contexto de seguridad
 */

import { HandlerEvent } from '@netlify/functions';
import { withAIAuth, AIContext } from './utils/auth';
import { executeMCPTool, logToolExecution, createMCPSupabaseClient } from './mcp-tools/supabase-mcp';
import { getMedicalHistory, summarizeMedicalHistory } from './mcp-tools/medical-history';
import { scheduleAppointment, getAvailableSlots } from './mcp-tools/appointments';
import { navigateToRoute, findPetAndNavigate, navigateToMedicalHistory } from './mcp-tools/navigation';
import { searchInventory } from './mcp-tools/inventory';
import { checkRateLimit } from './utils/rate-limiting';

interface ExecuteToolRequest {
  toolName: string;
  parameters: Record<string, any>;
  context: any;
}

interface ExecuteToolResponse {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Ejecuta el tool solicitado usando el MCP wrapper
 */
async function executeToolHandler(
  event: HandlerEvent,
  aiContext: AIContext
): Promise<ExecuteToolResponse> {
  const request: ExecuteToolRequest = JSON.parse(event.body || '{}');
  const { toolName, parameters } = request;

  if (!toolName) {
    throw new Error('toolName is required');
  }

  // Verificar rate limit (algunas tools están exentas)
  const rateLimitResult = checkRateLimit(aiContext, toolName);
  
  if (!rateLimitResult.allowed) {
    throw new Error(
      rateLimitResult.reason ||
        'Has alcanzado el límite de consultas. Intenta más tarde.'
    );
  }

  console.log('[AI Tool] Executing:', toolName, 'for user:', aiContext.userId);
  console.log('[AI Tool] Rate limit:', {
    remaining: rateLimitResult.remaining,
    resetAt: new Date(rateLimitResult.resetAt).toLocaleString(),
  });

  // Extraer token del header
  const token = event.headers.authorization?.replace('Bearer ', '') || '';
  const startTime = Date.now();

  try {
    let result;

    // Ejecutar tool usando MCP wrapper
    switch (toolName) {
      case 'get_medical_history':
        result = await executeMCPTool(
          toolName,
          (ctx) => getMedicalHistory(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'summarize_medical_history':
        result = await executeMCPTool(
          toolName,
          (ctx) => summarizeMedicalHistory(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'schedule_appointment':
        result = await executeMCPTool(
          toolName,
          (ctx) => scheduleAppointment(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'get_available_slots':
        result = await executeMCPTool(
          toolName,
          (ctx) => getAvailableSlots(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'navigate_to_route':
        result = await executeMCPTool(
          toolName,
          (ctx) => navigateToRoute(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'find_pet_and_navigate':
        result = await executeMCPTool(
          toolName,
          (ctx) => findPetAndNavigate(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'navigate_to_medical_history':
        result = await executeMCPTool(
          toolName,
          (ctx) => navigateToMedicalHistory(parameters, ctx),
          token,
          aiContext
        );
        break;

      case 'search_inventory':
        result = await executeMCPTool(
          toolName,
          (ctx) => searchInventory(parameters, ctx),
          token,
          aiContext
        );
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    // Log de auditoría
    const duration = Date.now() - startTime;
    logToolExecution(toolName, aiContext, result.success, duration);

    return {
      success: result.success,
      result: result.data,
      error: result.error,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logToolExecution(toolName, aiContext, false, duration);
    throw error;
  }
}

export const handler = withAIAuth(executeToolHandler);
