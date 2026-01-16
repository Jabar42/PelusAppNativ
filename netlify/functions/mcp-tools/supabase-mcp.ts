/**
 * Supabase MCP Wrapper
 * Wrapper custom de MCP para Supabase que inyecta contexto de seguridad (JWT)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AIContext } from '../utils/auth';

export interface MCPToolContext {
  supabase: SupabaseClient;
  aiContext: AIContext;
  jwt: string;
}

/**
 * Crea un cliente de Supabase con el JWT de Clerk inyectado
 * Esto activa automáticamente el RLS con el contexto correcto
 */
export function createMCPSupabaseClient(jwt: string): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Valida que el usuario tenga los permisos necesarios para ejecutar un tool
 */
export function validateToolPermissions(
  toolName: string,
  context: AIContext
): { allowed: boolean; reason?: string } {
  // Tools disponibles para todos (navegación)
  const publicTools = ['navigate_to_route', 'find_pet_and_navigate', 'navigate_to_medical_history'];
  
  if (publicTools.includes(toolName)) {
    return { allowed: true };
  }

  // Tools que usan RLS para filtrar datos (B2C y B2B)
  // RLS se encarga de mostrar solo los datos permitidos según el contexto
  const rlsProtectedTools = ['get_medical_history', 'summarize_medical_history'];
  
  if (rlsProtectedTools.includes(toolName)) {
    // No requiere validación de userType, RLS filtra automáticamente
    return { allowed: true };
  }

  // Tools que requieren ser profesional en una organización (solo B2B)
  const b2bTools = [
    'schedule_appointment',
    'get_available_slots',
    'search_inventory',
  ];

  if (b2bTools.includes(toolName)) {
    if (context.userType !== 'professional') {
      return {
        allowed: false,
        reason: 'Este tool requiere ser usuario profesional',
      };
    }

    if (!context.orgId) {
      return {
        allowed: false,
        reason: 'Este tool requiere estar en una organización activa',
      };
    }

    // Tools que además requieren sede activa
    const locationTools = ['search_inventory', 'schedule_appointment', 'get_available_slots'];
    
    if (locationTools.includes(toolName) && !context.activeLocationId) {
      return {
        allowed: false,
        reason: 'Este tool requiere tener una sede activa seleccionada',
      };
    }

    return { allowed: true };
  }

  // 🔒 SEGURIDAD: Denegar por defecto (fail closed)
  // Si un tool no está en ninguna lista, debe agregarse explícitamente
  console.error(`[Security] Tool "${toolName}" no está registrado en las listas de permisos`);
  return {
    allowed: false,
    reason: `Tool "${toolName}" no está autorizado. Contacta al administrador del sistema.`,
  };
}

/**
 * Wrapper genérico para ejecutar tools MCP con validación de permisos
 */
export async function executeMCPTool<T>(
  toolName: string,
  toolFunction: (context: MCPToolContext) => Promise<T>,
  jwt: string,
  aiContext: AIContext
): Promise<{ success: boolean; data?: T; error?: string }> {
  // 1. Validar permisos
  const permissionCheck = validateToolPermissions(toolName, aiContext);
  
  if (!permissionCheck.allowed) {
    console.warn(`[MCP] Permission denied for tool ${toolName}:`, permissionCheck.reason);
    return {
      success: false,
      error: permissionCheck.reason || 'Permission denied',
    };
  }

  // 2. Crear cliente con JWT
  const supabase = createMCPSupabaseClient(jwt);

  // 3. Crear contexto del tool
  const toolContext: MCPToolContext = {
    supabase,
    aiContext,
    jwt,
  };

  // 4. Ejecutar tool
  try {
    const result = await toolFunction(toolContext);
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error(`[MCP] Error executing tool ${toolName}:`, error);
    return {
      success: false,
      error: error.message || 'Tool execution failed',
    };
  }
}

/**
 * Logging helper para auditoría de uso de tools
 */
export function logToolExecution(
  toolName: string,
  context: AIContext,
  success: boolean,
  duration: number
) {
  console.log('[MCP Tool Audit]', {
    tool: toolName,
    userId: context.userId,
    orgId: context.orgId,
    locationId: context.activeLocationId,
    userType: context.userType,
    success,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
}
