/**
 * MCP Tools para gestión de sedes (locations)
 * Permite crear, listar y gestionar sedes de una organización
 */

import { MCPToolContext } from './supabase-mcp';

export interface CreateLocationParams {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
}

export interface Location {
  id: string;
  org_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Tool: create_location
 * Crea una nueva sede para la organización activa
 * 
 * RLS: Solo usuarios profesionales con rol admin/creator en organizaciones
 * Requiere: userType=professional, orgId, orgRole=org:admin|org:creator
 */
export async function createLocation(
  params: CreateLocationParams,
  context: MCPToolContext
): Promise<Location> {
  const { name, address, city, state, country, phone, email, isMain } = params;
  const { supabase, aiContext } = context;

  // Validar que tenga organización
  if (!aiContext.orgId) {
    throw new Error('Requiere organización activa para crear sedes');
  }

  // Validar que sea admin o creator
  if (!aiContext.role || !['org:admin', 'org:creator'].includes(aiContext.role)) {
    throw new Error('Solo los administradores pueden crear sedes');
  }

  console.log('[Tool] create_location:', {
    name,
    orgId: aiContext.orgId,
    role: aiContext.role,
  });

  // Verificar si ya existe una sede principal
  let shouldBeMain = isMain !== false; // Por defecto true si no se especifica
  
  if (shouldBeMain) {
    const { data: existingMain } = await supabase
      .from('locations')
      .select('id')
      .eq('org_id', aiContext.orgId)
      .eq('is_main', true)
      .maybeSingle();

    if (existingMain) {
      shouldBeMain = false; // Ya existe una sede principal
    }
  }

  // Crear la sede
  const { data, error } = await supabase
    .from('locations')
    .insert({
      org_id: aiContext.orgId,
      name: name.trim(),
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      country: country?.trim() || 'Colombia',
      phone: phone?.trim() || undefined,
      email: email?.trim() || undefined,
      is_primary: false,
      is_main: shouldBeMain,
    })
    .select()
    .single();

  if (error) {
    console.error('[Tool] create_location error:', error);
    throw new Error(`Error al crear la sede: ${error.message}`);
  }

  if (!data) {
    throw new Error('No se pudo crear la sede');
  }

  // Si es la primera sede (principal), actualizar active_location_id en Clerk
  // Nota: Esto requiere acceso a Clerk, pero por ahora solo retornamos la sede creada
  // El frontend o otra función puede manejar la actualización de active_location_id

  return data as Location;
}

/**
 * Tool: list_locations
 * Lista todas las sedes de la organización activa
 * 
 * RLS: Solo usuarios profesionales en organizaciones
 * Requiere: userType=professional, orgId
 */
export async function listLocations(
  params: Record<string, any>,
  context: MCPToolContext
): Promise<Location[]> {
  const { supabase, aiContext } = context;

  // Validar que tenga organización
  if (!aiContext.orgId) {
    throw new Error('Requiere organización activa para listar sedes');
  }

  console.log('[Tool] list_locations:', {
    orgId: aiContext.orgId,
  });

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('org_id', aiContext.orgId)
    .order('is_main', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Tool] list_locations error:', error);
    throw new Error(`Error al listar sedes: ${error.message}`);
  }

  return (data || []) as Location[];
}
