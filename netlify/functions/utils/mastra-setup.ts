/**
 * Mastra Setup
 * Inicialización de Mastra con agentes y tools configurados
 * Según arquitectura documentada en docs/AI_ARCHITECTURE.md
 */
/// <reference types="node" />

import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
// @ts-ignore - Los tipos están disponibles pero el linter no los encuentra desde el subdirectorio
import { openai } from '@ai-sdk/openai';
// @ts-ignore - Los tipos están disponibles pero el linter no los encuentra desde el subdirectorio
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { veterinaryAgentConfig } from '../../../src/features/AI_Core/agents/veterinaryAgent';
import { AIContext } from './auth';
import { executeMCPTool } from '../mcp-tools/supabase-mcp';
import { getMedicalHistory } from '../mcp-tools/medical-history';
import { scheduleAppointment, getAvailableSlots } from '../mcp-tools/appointments';
import { navigateToRoute, findPetAndNavigate } from '../mcp-tools/navigation';
import { searchInventory } from '../mcp-tools/inventory';
import { createLocation, listLocations } from '../mcp-tools/locations';
import { assignUserToLocation, listLocationAssignments, removeLocationAssignment } from '../mcp-tools/location-assignments';

/**
 * Configuración de modelos con fallback
 * Orden de prioridad: OpenAI -> Gemini -> DeepSeek -> Anthropic
 */
interface ModelConfig {
  provider: 'openai' | 'google' | 'deepseek' | 'anthropic';
  modelName: string;
  apiKeyEnv: string;
  createModel: (modelName: string) => any;
}

const MODEL_FALLBACK_CHAIN: ModelConfig[] = [
  {
    provider: 'openai',
    modelName: process.env.AI_MODEL || 'gpt-4o-mini',
    apiKeyEnv: 'OPENAI_API_KEY',
    createModel: (name) => openai(name),
  },
  {
    provider: 'google',
    modelName: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    apiKeyEnv: 'GOOGLE_GENERATIVE_AI_API_KEY',
    createModel: (name) => google(name),
  },
  {
    provider: 'deepseek',
    modelName: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
    createModel: (name) => deepseek(name),
  },
  {
    provider: 'anthropic',
    modelName: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    createModel: (name) => anthropic(name),
  },
];

/**
 * Obtiene el modelo configurado según el proveedor
 * Si AI_PROVIDER está configurado, usa ese específico
 * Si no, intenta usar el primer modelo disponible en la cadena de fallback
 */
function getModel() {
  const aiProvider = process.env.AI_PROVIDER;

  // Si hay un proveedor específico configurado, usarlo
  if (aiProvider) {
    const config = MODEL_FALLBACK_CHAIN.find(c => c.provider === aiProvider);
    if (!config) {
      throw new Error(`Proveedor de IA no soportado: ${aiProvider}`);
    }
    
    if (!process.env[config.apiKeyEnv]) {
      throw new Error(`${config.apiKeyEnv} no está configurada`);
    }
    
    return config.createModel(config.modelName);
  }

  // Si no hay proveedor específico, intentar en orden de fallback
  for (const config of MODEL_FALLBACK_CHAIN) {
    if (process.env[config.apiKeyEnv]) {
      console.log(`[Mastra] Usando modelo: ${config.provider}/${config.modelName}`);
      return config.createModel(config.modelName);
    }
  }

  // Si ningún modelo está disponible, lanzar error
  const availableKeys = MODEL_FALLBACK_CHAIN.map(c => c.apiKeyEnv).join(', ');
  throw new Error(
    `Ningún modelo de IA está configurado. Configura al menos una de estas variables: ${availableKeys}`
  );
}

/**
 * Crea tools de Mastra que se conectan con nuestros MCP tools
 */
export function createMCPToolsForMastra(token: string, aiContext: AIContext) {
  return {
    get_medical_history: createTool({
      id: 'get_medical_history',
      description: 'Obtiene el historial médico completo de una mascota por su ID',
      inputSchema: z.object({
        petId: z.string().describe('ID de la mascota'),
        limit: z.number().optional().describe('Número máximo de registros'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { petId: string; limit?: number };
        const result = await executeMCPTool(
          'get_medical_history',
          (ctx) => getMedicalHistory(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al obtener historial médico');
        }
        return result.data;
      },
    }),

    schedule_appointment: createTool({
      id: 'schedule_appointment',
      description: 'Agenda una cita veterinaria verificando disponibilidad',
      inputSchema: z.object({
        petId: z.string().describe('ID de la mascota'),
        dateTime: z.string().describe('Fecha y hora en formato ISO 8601'),
        reason: z.string().describe('Motivo de la consulta'),
        duration: z.number().optional().describe('Duración en minutos (opcional, default 30)'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { petId: string; dateTime: string; reason: string; duration?: number };
        const result = await executeMCPTool(
          'schedule_appointment',
          (ctx) => scheduleAppointment(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al agendar cita');
        }
        return result.data;
      },
    }),

    get_available_slots: createTool({
      id: 'get_available_slots',
      description: 'Obtiene horarios disponibles para agendar citas en una fecha específica',
      inputSchema: z.object({
        date: z.string().describe('Fecha en formato YYYY-MM-DD'),
        duration: z.number().optional().describe('Duración en minutos (opcional, default 30)'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { date: string; duration?: number };
        const result = await executeMCPTool(
          'get_available_slots',
          (ctx) => getAvailableSlots(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al obtener horarios disponibles');
        }
        return result.data;
      },
    }),

    navigate_to_route: createTool({
      id: 'navigate_to_route',
      description: 'Navega a una pantalla específica de la aplicación',
      inputSchema: z.object({
        screen: z.string().describe('Ruta de la pantalla'),
        params: z.record(z.string(), z.any()).optional().describe('Parámetros de la ruta (opcional)'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { screen: string; params?: Record<string, any> };
        const result = await executeMCPTool(
          'navigate_to_route',
          (ctx) => navigateToRoute(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al navegar');
        }
        return result.data;
      },
    }),

    find_pet_and_navigate: createTool({
      id: 'find_pet_and_navigate',
      description: 'Busca una mascota por nombre y navega a su detalle',
      inputSchema: z.object({
        petName: z.string().describe('Nombre de la mascota'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { petName: string };
        const result = await executeMCPTool(
          'find_pet_and_navigate',
          (ctx) => findPetAndNavigate(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al buscar mascota');
        }
        return result.data;
      },
    }),

    search_inventory: createTool({
      id: 'search_inventory',
      description: 'Busca productos o medicamentos en el inventario de la sede activa',
      inputSchema: z.object({
        query: z.string().describe('Término de búsqueda'),
        category: z.string().optional().describe('Categoría (opcional)'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { query: string; category?: string };
        const result = await executeMCPTool(
          'search_inventory',
          (ctx) => searchInventory(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al buscar en inventario');
        }
        return result.data;
      },
    }),

    create_location: createTool({
      id: 'create_location',
      description: 'Crea una nueva sede para la organización activa. Requiere ser administrador.',
      inputSchema: z.object({
        name: z.string().describe('Nombre de la sede'),
        address: z.string().optional().describe('Dirección (opcional)'),
        city: z.string().optional().describe('Ciudad (opcional)'),
        state: z.string().optional().describe('Estado/Departamento (opcional)'),
        phone: z.string().optional().describe('Teléfono (opcional)'),
        email: z.string().optional().describe('Email (opcional)'),
      }),
      execute: async (inputData: any) => {
        const params = inputData as { name: string; address?: string; city?: string; state?: string; phone?: string; email?: string };
        const result = await executeMCPTool(
          'create_location',
          (ctx) => createLocation(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al crear sede');
        }
        return result.data;
      },
    }),

    list_locations: createTool({
      id: 'list_locations',
      description: 'Lista todas las sedes de la organización activa',
      inputSchema: z.object({}),
      execute: async (_inputData: any, _context?: any) => {
        const result = await executeMCPTool(
          'list_locations',
          (ctx) => listLocations({}, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al listar sedes');
        }
        return result.data;
      },
    }),

    assign_user_to_location: createTool({
      id: 'assign_user_to_location',
      description: 'Asigna un usuario a una sede con un rol específico. Requiere ser administrador de la organización.',
      inputSchema: z.object({
        userId: z.string().describe('ID del usuario a asignar'),
        locationId: z.string().describe('ID de la sede'),
        role: z.enum(['admin', 'manager', 'staff', 'viewer']).describe('Rol del usuario en la sede'),
      }),
      execute: async (context: any) => {
        const params = context.input as { userId: string; locationId: string; role: 'admin' | 'manager' | 'staff' | 'viewer' };
        const result = await executeMCPTool(
          'assign_user_to_location',
          (ctx) => assignUserToLocation(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al asignar usuario a sede');
        }
        return result.data;
      },
    }),

    list_location_assignments: createTool({
      id: 'list_location_assignments',
      description: 'Lista asignaciones de usuarios a sedes. Puede filtrar por sede específica.',
      inputSchema: z.object({
        locationId: z.string().optional().describe('ID de la sede (opcional, si no se proporciona lista todas las asignaciones de la organización)'),
      }),
      execute: async (context: any) => {
        const params = context.input as { locationId?: string };
        const result = await executeMCPTool(
          'list_location_assignments',
          (ctx) => listLocationAssignments(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al listar asignaciones');
        }
        return result.data;
      },
    }),

    remove_location_assignment: createTool({
      id: 'remove_location_assignment',
      description: 'Remueve una asignación de usuario a sede. Requiere ser administrador de la organización.',
      inputSchema: z.object({
        assignmentId: z.string().describe('ID de la asignación a remover'),
      }),
      execute: async (context: any) => {
        const params = context.input as { assignmentId: string };
        const result = await executeMCPTool(
          'remove_location_assignment',
          (ctx) => removeLocationAssignment(params, ctx),
          token,
          aiContext
        );
        if (!result.success) {
          throw new Error(result.error || 'Error al remover asignación');
        }
        return result.data;
      },
    }),
  };
}

/**
 * Inicializa el agente veterinario con Mastra
 */
export function initializeVeterinaryAgent(token: string, aiContext: AIContext): Agent {
  const tools = createMCPToolsForMastra(token, aiContext);
  
  // Filtrar tools según la configuración del agente
  const agentTools: Record<string, any> = {};
  for (const toolName of veterinaryAgentConfig.tools) {
    if (tools[toolName as keyof typeof tools]) {
      agentTools[toolName] = tools[toolName as keyof typeof tools];
    }
  }

  // Preparar instrucciones con contexto del usuario
  const instructions = `${veterinaryAgentConfig.systemPrompt}

Contexto del usuario:
- Tipo: ${aiContext.userType}
- Organización: ${aiContext.orgId || 'No activa'}
- Sede activa: ${aiContext.activeLocationId || 'No activa'}`;

  const model = getModel();
  
  return new Agent({
    id: veterinaryAgentConfig.name,
    name: veterinaryAgentConfig.name,
    instructions,
    model: model as any, // Mastra acepta LanguageModelV3
    tools: agentTools,
  });
}
