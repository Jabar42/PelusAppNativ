/**
 * MCP Tool: Navigation
 * Tools para navegación asistida por IA
 */

import { MCPToolContext } from './supabase-mcp';

export interface NavigateParams {
  screen: string;
  params?: Record<string, any>;
}

export interface NavigationAction {
  type: 'navigate';
  screen: string;
  params?: Record<string, any>;
}

/**
 * Tool: navigate_to_route
 * Genera una acción de navegación para el frontend
 * 
 * Disponible para todos los usuarios (B2C y B2B)
 */
export async function navigateToRoute(
  params: NavigateParams,
  context: MCPToolContext
): Promise<NavigationAction> {
  const { screen, params: routeParams } = params;
  const { aiContext } = context;

  console.log('[Tool] navigate_to_route:', {
    screen,
    params: routeParams,
    userId: aiContext.userId,
  });

  // Validar que la ruta sea válida
  const validRoutes = [
    '/(tabs)/',
    '/(tabs)/fav',
    '/(tabs)/help',
    '/(tabs)/pro',
    '/(tabs)/settings',
    '/(tabs)/locations-management',
    '/pet-detail',
    '/add-edit-pet',
    '/medical-histories',
    '/add-edit-medical-history',
  ];

  if (!validRoutes.includes(screen) && !screen.startsWith('/(')) {
    throw new Error(`Ruta no válida: ${screen}`);
  }

  // Retornar acción de navegación
  return {
    type: 'navigate',
    screen,
    params: routeParams,
  };
}

/**
 * Tool: find_pet_and_navigate
 * Busca una mascota por nombre y navega a su detalle
 * 
 * Este tool combina búsqueda + navegación
 */
export async function findPetAndNavigate(
  params: { petName: string },
  context: MCPToolContext
): Promise<NavigationAction> {
  const { petName } = params;
  const { supabase, aiContext } = context;

  console.log('[Tool] find_pet_and_navigate:', {
    petName,
    userId: aiContext.userId,
  });

  // Buscar mascota por nombre (RLS aplica automáticamente)
  const { data: pets, error } = await supabase
    .from('pets')
    .select('id, name')
    .ilike('name', `%${petName}%`)
    .limit(5);

  if (error) {
    throw new Error(`Error buscando mascota: ${error.message}`);
  }

  if (!pets || pets.length === 0) {
    throw new Error(`No se encontró ninguna mascota con el nombre "${petName}"`);
  }

  // Si hay múltiples resultados, tomar el primero (o el que mejor coincida)
  const bestMatch = pets[0];

  return {
    type: 'navigate',
    screen: '/pet-detail',
    params: {
      petId: bestMatch.id,
    },
  };
}

/**
 * Tool: navigate_to_medical_history
 * Navega al historial médico de una mascota específica
 */
export async function navigateToMedicalHistory(
  params: { petId: string; filter?: string },
  context: MCPToolContext
): Promise<NavigationAction> {
  const { petId, filter } = params;

  console.log('[Tool] navigate_to_medical_history:', { petId, filter });

  return {
    type: 'navigate',
    screen: '/medical-histories',
    params: {
      petId,
      filter,
    },
  };
}
