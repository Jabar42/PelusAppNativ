/**
 * MCP Tools Index
 * Definiciones de tools que el agente puede usar
 */

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

/**
 * Tool: get_medical_history
 * Consulta el historial médico de una mascota
 */
export const getMedicalHistoryTool: MCPTool = {
  name: 'get_medical_history',
  description: 'Obtiene el historial médico completo de una mascota por su ID. Requiere acceso a datos de la organización.',
  parameters: {
    type: 'object',
    properties: {
      petId: {
        type: 'string',
        description: 'ID de la mascota',
      },
      limit: {
        type: 'number',
        description: 'Número máximo de registros a retornar (opcional)',
      },
    },
    required: ['petId'],
  },
};

/**
 * Tool: schedule_appointment
 * Agenda una cita veterinaria
 */
export const scheduleAppointmentTool: MCPTool = {
  name: 'schedule_appointment',
  description: 'Agenda una cita veterinaria verificando disponibilidad. Requiere acceso a la sede activa.',
  parameters: {
    type: 'object',
    properties: {
      petId: {
        type: 'string',
        description: 'ID de la mascota',
      },
      dateTime: {
        type: 'string',
        description: 'Fecha y hora de la cita en formato ISO 8601',
      },
      reason: {
        type: 'string',
        description: 'Motivo de la consulta',
      },
      duration: {
        type: 'number',
        description: 'Duración estimada en minutos (opcional, default 30)',
      },
    },
    required: ['petId', 'dateTime', 'reason'],
  },
};

/**
 * Tool: search_inventory
 * Busca productos en el inventario
 */
export const searchInventoryTool: MCPTool = {
  name: 'search_inventory',
  description: 'Busca productos o medicamentos en el inventario de la sede activa.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Término de búsqueda (nombre del producto, categoría, etc.)',
      },
      category: {
        type: 'string',
        description: 'Categoría específica (opcional): medicina, alimento, accesorio',
      },
      inStock: {
        type: 'boolean',
        description: 'Solo mostrar productos en stock (opcional)',
      },
    },
    required: ['query'],
  },
};

/**
 * Tool: navigate_to_route
 * Navega a una ruta específica de la app
 */
export const navigateToRouteTool: MCPTool = {
  name: 'navigate_to_route',
  description: 'Navega a una pantalla específica de la aplicación. Disponible para todos los usuarios.',
  parameters: {
    type: 'object',
    properties: {
      screen: {
        type: 'string',
        description: 'Nombre de la pantalla: /pet-detail, /medical-histories, /(tabs)/, /settings, etc.',
      },
      params: {
        type: 'object',
        description: 'Parámetros de la ruta (opcional): {petId, filter, etc.}',
      },
    },
    required: ['screen'],
  },
};

// Exportar array de todos los tools
export const allMCPTools: MCPTool[] = [
  getMedicalHistoryTool,
  scheduleAppointmentTool,
  searchInventoryTool,
  navigateToRouteTool,
];
