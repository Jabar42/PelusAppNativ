import { clerkClient } from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import { Handler } from '@netlify/functions';
import { withCors, handleOptions } from './utils/cors';

// Inicializar Clerk Client
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required. Make sure it is set in your .env file.');
}

// Variables de Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

/**
 * Crea un cliente de Supabase autenticado con el JWT del usuario
 */
function createAuthenticatedSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Crea un cliente de Supabase con service_role key (bypass RLS)
 * SOLO para uso en operaciones administrativas donde ya validamos permisos
 */
function createAdminSupabaseClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}

/**
 * Verifica que el usuario es admin de la organización
 */
async function verifyOrgAdmin(userId: string, orgId: string): Promise<boolean> {
  try {
    const membership = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    
    const userMembership = membership.data.find(m => m.publicUserData?.userId === userId);
    return userMembership?.role === 'org:admin' || userMembership?.role === 'org:creator';
  } catch (error) {
    console.error('Error verifying org admin:', error);
    return false;
  }
}

/**
 * Verifica que un usuario es miembro de la organización
 */
async function verifyOrgMember(userId: string, orgId: string): Promise<boolean> {
  try {
    const membership = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });
    
    return membership.data.some(m => m.publicUserData?.userId === userId);
  } catch (error) {
    console.error('Error verifying org member:', error);
    return false;
  }
}

/**
 * Obtiene el userId del JWT de Clerk
 */
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const session = await clerkClient.verifyToken(token);
    return session.sub || null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Función principal para gestionar sedes
 */
export const handler: Handler = async (event) => {
  // Manejar Preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return withCors({ 
      statusCode: 401, 
      body: JSON.stringify({ error: 'No autorizado' }) 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const userId = await getUserIdFromToken(token);
  
  if (!userId) {
    return withCors({ 
      statusCode: 401, 
      body: JSON.stringify({ error: 'Token inválido' }) 
    });
  }

  const supabase = createAuthenticatedSupabaseClient(token);
  const path = event.path.replace('/.netlify/functions/manage-location', '');
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // GET /manage-location/list - Listar sedes de la organización
    if (event.httpMethod === 'GET' && path === '/list') {
      const { orgId } = event.queryStringParameters || {};
      
      if (!orgId) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'orgId es requerido' }) 
        });
      }

      // Verificar que el usuario es miembro de la org
      const isMember = await verifyOrgMember(userId, orgId);
      if (!isMember) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'No tienes acceso a esta organización' }) 
        });
      }

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('org_id', orgId)
        .order('is_main', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return withCors({
        statusCode: 200,
        body: JSON.stringify({ locations: data }),
      });
    }

    // POST /manage-location - Crear nueva sede
    if (event.httpMethod === 'POST' && path === '') {
      const { orgId, name, address, city, state, country, phone, email, isMain } = body;

      if (!orgId || !name) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'orgId y name son requeridos' }) 
        });
      }

      // Verificar que el usuario es admin
      const isAdmin = await verifyOrgAdmin(userId, orgId);
      if (!isAdmin) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Solo los administradores pueden crear sedes' }) 
        });
      }

      // Verificar si ya existe una sede principal
      let shouldBeMain = isMain !== false; // Por defecto true si no se especifica
      
      // Usar admin client para verificar (bypass RLS) ya que validamos permisos arriba
      const adminSupabase = supabaseServiceRoleKey ? createAdminSupabaseClient() : supabase;
      
      if (shouldBeMain) {
        const { data: existingMain } = await adminSupabase
          .from('locations')
          .select('id')
          .eq('org_id', orgId)
          .eq('is_main', true)
          .maybeSingle();

        if (existingMain) {
          shouldBeMain = false; // Ya existe una sede principal
        }
      }

      // Crear la sede usando admin client para evitar problemas de RLS con token no actualizado
      // Esto es seguro porque ya validamos que el usuario es admin arriba
      let location;
      let error;
      
      if (supabaseServiceRoleKey) {
        // Usar admin client (bypass RLS) - más confiable para primera sede
        const result = await adminSupabase
          .from('locations')
          .insert({
            org_id: orgId,
            name,
            address,
            city,
            state,
            country: country || 'Colombia',
            phone,
            email,
            is_primary: false, // Solo la primera sede creada será primary
            is_main: shouldBeMain,
          })
          .select()
          .single();
        
        location = result.data;
        error = result.error;
      } else {
        // Fallback: usar cliente autenticado si no hay service_role key
        const result = await supabase
          .from('locations')
          .insert({
            org_id: orgId,
            name,
            address,
            city,
            state,
            country: country || 'Colombia',
            phone,
            email,
            is_primary: false,
            is_main: shouldBeMain,
          })
          .select()
          .single();
        
        location = result.data;
        error = result.error;
      }

      if (error || !location) {
        // Si el error es de RLS, proporcionar un mensaje más útil
        if (error?.message?.includes('row-level security policy')) {
          const rlsError = new Error(
            'Error de seguridad (RLS): El JWT no tiene los claims necesarios.\n\n' +
            'SOLUCIÓN:\n' +
            '1. Verifica que el template "supabase" existe en Clerk Dashboard\n' +
            '2. Asegúrate de que el template tenga estos claims:\n' +
            '   - user_id: {{user.id}}\n' +
            '   - org_id: {{org.id}}\n' +
            '   - org_role: {{org.role}}\n' +
            '   - active_location_id: {{org.publicMetadata.active_location_id}}\n' +
            '3. Si usas SUPABASE_SERVICE_ROLE_KEY, verifica que esté configurado en Netlify\n\n' +
            `Error original: ${error.message}`
          );
          rlsError.name = 'RLSError';
          throw rlsError;
        }
        throw error || new Error('No se pudo crear la sede');
      }

      // Si es la primera sede, marcarla como principal y asignar al creador
      if (shouldBeMain) {
        // Asignar al creador como admin de la sede usando admin client
        const adminSupabaseForAssignment = supabaseServiceRoleKey ? createAdminSupabaseClient() : supabase;
        const { error: assignmentError } = await adminSupabaseForAssignment
          .from('user_location_assignments')
          .insert({
            user_id: userId,
            org_id: orgId,
            location_id: location.id,
            role: 'admin',
            assigned_by: userId,
          });
        
        if (assignmentError) {
          console.error('Error asignando usuario a sede:', assignmentError);
          // No fallar completamente, pero loguear el error
        }

        // Actualizar active_location_id en Clerk
        await clerkClient.organizations.updateOrganizationMetadata(orgId, {
          publicMetadata: {
            active_location_id: location.id,
          },
        });
      }

      return withCors({
        statusCode: 201,
        body: JSON.stringify({ location }),
      });
    }

    // PUT /manage-location - Actualizar sede
    if (event.httpMethod === 'PUT' && path === '') {
      const { locationId, name, address, city, state, country, phone, email, isMain } = body;

      if (!locationId) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'locationId es requerido' }) 
        });
      }

      // Obtener la sede para verificar org_id
      const { data: location, error: fetchError } = await supabase
        .from('locations')
        .select('org_id')
        .eq('id', locationId)
        .single();

      if (fetchError || !location) {
        return withCors({ 
          statusCode: 404, 
          body: JSON.stringify({ error: 'Sede no encontrada' }) 
        });
      }

      // Verificar que el usuario es admin
      const isAdmin = await verifyOrgAdmin(userId, location.org_id);
      if (!isAdmin) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Solo los administradores pueden actualizar sedes' }) 
        });
      }

      // Si se está marcando como principal, desmarcar las demás
      if (isMain === true) {
        await supabase
          .from('locations')
          .update({ is_main: false })
          .eq('org_id', location.org_id)
          .neq('id', locationId);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (country !== undefined) updateData.country = country;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (isMain !== undefined) updateData.is_main = isMain;

      const { data: updatedLocation, error } = await supabase
        .from('locations')
        .update(updateData)
        .eq('id', locationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return withCors({
        statusCode: 200,
        body: JSON.stringify({ location: updatedLocation }),
      });
    }

    // DELETE /manage-location - Eliminar sede
    if (event.httpMethod === 'DELETE' && path === '') {
      const { locationId } = event.queryStringParameters || body;

      if (!locationId) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'locationId es requerido' }) 
        });
      }

      // Obtener la sede para verificar org_id
      const { data: location, error: fetchError } = await supabase
        .from('locations')
        .select('org_id')
        .eq('id', locationId)
        .single();

      if (fetchError || !location) {
        return withCors({ 
          statusCode: 404, 
          body: JSON.stringify({ error: 'Sede no encontrada' }) 
        });
      }

      // Verificar que el usuario es admin
      const isAdmin = await verifyOrgAdmin(userId, location.org_id);
      if (!isAdmin) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Solo los administradores pueden eliminar sedes' }) 
        });
      }

      // Verificar que no sea la última sede
      const { data: allLocations } = await supabase
        .from('locations')
        .select('id')
        .eq('org_id', location.org_id);

      if (allLocations && allLocations.length <= 1) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'No se puede eliminar la última sede de la organización' }) 
        });
      }

      // El trigger de "sede huérfana" validará si hay registros asociados
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);

      if (error) {
        throw error;
      }

      return withCors({
        statusCode: 200,
        body: JSON.stringify({ message: 'Sede eliminada correctamente' }),
      });
    }

    // POST /manage-location/assign - Asignar usuario a sede
    if (event.httpMethod === 'POST' && path === '/assign') {
      const { orgId, locationId, targetUserId, role } = body;

      if (!orgId || !locationId || !targetUserId || !role) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'orgId, locationId, targetUserId y role son requeridos' }) 
        });
      }

      // Verificar que el usuario es admin
      const isAdmin = await verifyOrgAdmin(userId, orgId);
      if (!isAdmin) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Solo los administradores pueden asignar usuarios' }) 
        });
      }

      // Verificar que el usuario objetivo es miembro de la org
      const isMember = await verifyOrgMember(targetUserId, orgId);
      if (!isMember) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'El usuario debe ser miembro de la organización primero' }) 
        });
      }

      // Verificar que la sede existe y pertenece a la org
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .eq('id', locationId)
        .eq('org_id', orgId)
        .single();

      if (!location) {
        return withCors({ 
          statusCode: 404, 
          body: JSON.stringify({ error: 'Sede no encontrada o no pertenece a la organización' }) 
        });
      }

      // Desactivar asignación anterior si existe
      await supabase
        .from('user_location_assignments')
        .update({ is_active: false })
        .eq('user_id', targetUserId)
        .eq('location_id', locationId);

      // Crear nueva asignación
      const { data: assignment, error } = await supabase
        .from('user_location_assignments')
        .insert({
          user_id: targetUserId,
          org_id: orgId,
          location_id: locationId,
          role,
          assigned_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return withCors({
        statusCode: 201,
        body: JSON.stringify({ assignment }),
      });
    }

    // DELETE /manage-location/assign - Remover asignación
    if (event.httpMethod === 'DELETE' && path === '/assign') {
      const { assignmentId } = event.queryStringParameters || body;

      if (!assignmentId) {
        return withCors({ 
          statusCode: 400, 
          body: JSON.stringify({ error: 'assignmentId es requerido' }) 
        });
      }

      // Obtener la asignación para verificar org_id
      const { data: assignment, error: fetchError } = await supabase
        .from('user_location_assignments')
        .select('org_id')
        .eq('id', assignmentId)
        .single();

      if (fetchError || !assignment) {
        return withCors({ 
          statusCode: 404, 
          body: JSON.stringify({ error: 'Asignación no encontrada' }) 
        });
      }

      // Verificar que el usuario es admin
      const isAdmin = await verifyOrgAdmin(userId, assignment.org_id);
      if (!isAdmin) {
        return withCors({ 
          statusCode: 403, 
          body: JSON.stringify({ error: 'Solo los administradores pueden remover asignaciones' }) 
        });
      }

      const { error } = await supabase
        .from('user_location_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) {
        throw error;
      }

      return withCors({
        statusCode: 200,
        body: JSON.stringify({ message: 'Asignación removida correctamente' }),
      });
    }

    return withCors({ 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Método no permitido' }) 
    });
  } catch (error: any) {
    console.error('Error en manage-location:', error);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' }),
    });
  }
};




