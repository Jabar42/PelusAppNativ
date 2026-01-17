/**
 * MCP Tools para Location Assignments
 * Gestiona asignaciones de usuarios a sedes
 */

import { MCPToolContext } from './supabase-mcp';

export interface LocationAssignment {
  id: string;
  user_id: string;
  org_id: string;
  location_id: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
}

export interface AssignUserToLocationParams {
  userId: string;
  locationId: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
}

export interface ListLocationAssignmentsParams {
  locationId?: string;
}

export interface RemoveLocationAssignmentParams {
  assignmentId: string;
}

/**
 * Tool: assign_user_to_location
 * Asigna un usuario a una sede con un rol específico
 * 
 * RLS: Solo usuarios profesionales con rol admin/creator en organizaciones
 * Requiere: userType=professional, orgId, orgRole=org:admin|org:creator
 */
export async function assignUserToLocation(
  params: AssignUserToLocationParams,
  context: MCPToolContext
): Promise<LocationAssignment> {
  const { userId, locationId, role } = params;
  const { supabase, aiContext } = context;

  if (!aiContext.orgId) {
    throw new Error('Requiere una organización activa para asignar usuarios');
  }

  if (!aiContext.role || !['org:admin', 'org:creator'].includes(aiContext.role)) {
    throw new Error('Solo los administradores pueden asignar usuarios a sedes');
  }

  console.log('[Tool] assign_user_to_location:', {
    userId,
    locationId,
    role,
    orgId: aiContext.orgId,
  });

  // Verificar que la sede existe y pertenece a la org
  const { data: location, error: locationError } = await supabase
    .from('locations')
    .select('id, org_id')
    .eq('id', locationId)
    .eq('org_id', aiContext.orgId)
    .single();

  if (locationError || !location) {
    throw new Error(`Sede no encontrada o no pertenece a la organización: ${locationError?.message || 'Unknown error'}`);
  }

  // Desactivar asignación anterior si existe (soft delete)
  await supabase
    .from('user_location_assignments')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('location_id', locationId)
    .eq('is_active', true);

  // Crear nueva asignación
  const { data: assignment, error } = await supabase
    .from('user_location_assignments')
    .insert({
      user_id: userId,
      org_id: aiContext.orgId,
      location_id: locationId,
      role,
      assigned_by: aiContext.userId,
    })
    .select()
    .single();

  if (error || !assignment) {
    console.error('[Tool] assign_user_to_location error:', error);
    throw new Error(`Error al asignar usuario a sede: ${error?.message || 'Unknown error'}`);
  }

  return assignment as LocationAssignment;
}

/**
 * Tool: list_location_assignments
 * Lista asignaciones de usuarios a sedes
 * 
 * RLS: Solo usuarios profesionales en organizaciones
 * Requiere: userType=professional, orgId
 * 
 * @param locationId - Opcional. Si se proporciona, lista solo asignaciones de esa sede
 */
export async function listLocationAssignments(
  params: ListLocationAssignmentsParams,
  context: MCPToolContext
): Promise<LocationAssignment[]> {
  const { locationId } = params;
  const { supabase, aiContext } = context;

  if (!aiContext.orgId) {
    throw new Error('Requiere una organización activa para listar asignaciones');
  }

  console.log('[Tool] list_location_assignments:', {
    locationId,
    orgId: aiContext.orgId,
  });

  let query = supabase
    .from('user_location_assignments')
    .select('*')
    .eq('org_id', aiContext.orgId)
    .eq('is_active', true);

  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data, error } = await query.order('assigned_at', { ascending: false });

  if (error) {
    console.error('[Tool] list_location_assignments error:', error);
    throw new Error(`Error al listar asignaciones: ${error.message}`);
  }

  return (data || []) as LocationAssignment[];
}

/**
 * Tool: remove_location_assignment
 * Remueve una asignación de usuario a sede (soft delete)
 * 
 * RLS: Solo usuarios profesionales con rol admin/creator en organizaciones
 * Requiere: userType=professional, orgId, orgRole=org:admin|org:creator
 */
export async function removeLocationAssignment(
  params: RemoveLocationAssignmentParams,
  context: MCPToolContext
): Promise<{ success: boolean; message: string }> {
  const { assignmentId } = params;
  const { supabase, aiContext } = context;

  if (!aiContext.orgId) {
    throw new Error('Requiere una organización activa para remover asignaciones');
  }

  if (!aiContext.role || !['org:admin', 'org:creator'].includes(aiContext.role)) {
    throw new Error('Solo los administradores pueden remover asignaciones');
  }

  console.log('[Tool] remove_location_assignment:', {
    assignmentId,
    orgId: aiContext.orgId,
  });

  // Obtener la asignación para verificar que pertenece a la org
  const { data: assignment, error: fetchError } = await supabase
    .from('user_location_assignments')
    .select('org_id')
    .eq('id', assignmentId)
    .single();

  if (fetchError || !assignment) {
    throw new Error(`Asignación no encontrada: ${fetchError?.message || 'Unknown error'}`);
  }

  if (assignment.org_id !== aiContext.orgId) {
    throw new Error('La asignación no pertenece a la organización activa');
  }

  // Soft delete: marcar como inactiva
  const { error } = await supabase
    .from('user_location_assignments')
    .update({ is_active: false })
    .eq('id', assignmentId);

  if (error) {
    console.error('[Tool] remove_location_assignment error:', error);
    throw new Error(`Error al remover asignación: ${error.message}`);
  }

  return {
    success: true,
    message: 'Asignación removida correctamente',
  };
}
