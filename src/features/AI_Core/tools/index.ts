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

/**
 * Tool: create_location
 * Crea una nueva sede para la organización
 */
export const createLocationTool: MCPTool = {
  name: 'create_location',
  description: 'Crea una nueva sede (location) para la organización activa. Requiere ser administrador de la organización.',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Nombre de la sede (requerido)',
      },
      address: {
        type: 'string',
        description: 'Dirección de la sede (opcional)',
      },
      city: {
        type: 'string',
        description: 'Ciudad de la sede (opcional)',
      },
      state: {
        type: 'string',
        description: 'Estado o departamento (opcional)',
      },
      country: {
        type: 'string',
        description: 'País (opcional, default: Colombia)',
      },
      phone: {
        type: 'string',
        description: 'Teléfono de contacto (opcional)',
      },
      email: {
        type: 'string',
        description: 'Email de contacto (opcional)',
      },
      isMain: {
        type: 'boolean',
        description: 'Si debe ser la sede principal (opcional, default: true si es la primera)',
      },
    },
    required: ['name'],
  },
};

/**
 * Tool: list_locations
 * Lista todas las sedes de la organización
 */
export const listLocationsTool: MCPTool = {
  name: 'list_locations',
  description: 'Lista todas las sedes (locations) de la organización activa. Requiere ser usuario profesional en una organización.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Tool: assign_user_to_location
 * Asigna un usuario a una sede con un rol específico
 */
export const assignUserToLocationTool: MCPTool = {
  name: 'assign_user_to_location',
  description: 'Asigna un usuario a una sede con un rol específico. Requiere ser administrador de la organización.',
  parameters: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'ID del usuario a asignar',
      },
      locationId: {
        type: 'string',
        description: 'ID de la sede',
      },
      role: {
        type: 'string',
        enum: ['admin', 'manager', 'staff', 'viewer'],
        description: 'Rol del usuario en la sede',
      },
    },
    required: ['userId', 'locationId', 'role'],
  },
};

/**
 * Tool: list_location_assignments
 * Lista asignaciones de usuarios a sedes
 */
export const listLocationAssignmentsTool: MCPTool = {
  name: 'list_location_assignments',
  description: 'Lista asignaciones de usuarios a sedes. Puede filtrar por sede específica. Requiere ser usuario profesional en una organización.',
  parameters: {
    type: 'object',
    properties: {
      locationId: {
        type: 'string',
        description: 'ID de la sede (opcional, si no se proporciona lista todas las asignaciones de la organización)',
      },
    },
    required: [],
  },
};

/**
 * Tool: remove_location_assignment
 * Remueve una asignación de usuario a sede
 */
export const removeLocationAssignmentTool: MCPTool = {
  name: 'remove_location_assignment',
  description: 'Remueve una asignación de usuario a sede. Requiere ser administrador de la organización.',
  parameters: {
    type: 'object',
    properties: {
      assignmentId: {
        type: 'string',
        description: 'ID de la asignación a remover',
      },
    },
    required: ['assignmentId'],
  },
};

// Exportar array de todos los tools
export const allMCPTools: MCPTool[] = [
  getMedicalHistoryTool,
  scheduleAppointmentTool,
  searchInventoryTool,
  navigateToRouteTool,
  createLocationTool,
  listLocationsTool,
  assignUserToLocationTool,
  listLocationAssignmentsTool,
  removeLocationAssignmentTool,
];
