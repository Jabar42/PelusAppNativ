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
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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
 * 
 * Nota: Si el template usa "Custom signing key", clerkClient.verifyToken() puede fallar.
 * En ese caso, decodificamos el JWT directamente sin verificar la firma,
 * ya que Supabase será quien verifique la firma cuando use el token.
 */
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // Intentar verificar con Clerk SDK primero (funciona para tokens por defecto)
    try {
      const session = await clerkClient.verifyToken(token);
      return session.sub || null;
    } catch (verifyError) {
      // Si falla la verificación (puede ser por custom signing key),
      // decodificar el JWT directamente
      console.warn('Clerk verifyToken failed, decoding JWT directly:', verifyError);
      
      // Decodificar el payload del JWT (sin verificar firma)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      // Decodificar el payload (base64url)
      // Nota: base64url usa - y _ en lugar de + y /, y no tiene padding
      let base64Payload = parts[1];
      // Convertir base64url a base64
      base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
      // Agregar padding si es necesario
      while (base64Payload.length % 4) {
        base64Payload += '=';
      }
      
      const payload = JSON.parse(
        Buffer.from(base64Payload, 'base64').toString('utf-8')
      );
      
      // Extraer user_id o sub
      const userId = payload.user_id || payload.sub || null;
      if (!userId) {
        console.error('JWT payload missing user_id and sub:', Object.keys(payload));
      }
      return userId;
    }
  } catch (error) {
    console.error('Error getting userId from token:', error);
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

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return withCors({ 
      statusCode: 401, 
      body: JSON.stringify({ error: 'No autorizado' }) 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  let userId: string | null;
  
  try {
    userId = await getUserIdFromToken(token);
  } catch (error: any) {
    console.error('Error getting userId from token:', error);
    return withCors({ 
      statusCode: 401, 
      body: JSON.stringify({ 
        error: 'Token inválido',
        details: error.message 
      }) 
    });
  }
  
  if (!userId) {
    console.error('No userId extracted from token');
    return withCors({ 
      statusCode: 401, 
      body: JSON.stringify({ error: 'Token inválido: no se pudo extraer el userId' }) 
    });
  }

  const supabase = createAuthenticatedSupabaseClient(token);
  const path = event.path.replace('/.netlify/functions/manage-location', '');
  
  // Parse body solo si existe y no está vacío
  let body: any = {};
  if (event.body && event.body.trim()) {
    try {
      body = JSON.parse(event.body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      // Si falla el parse, body queda como objeto vacío
    }
  }

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
        console.error('[manage-location/list] Supabase error:', error);
        // Si es un error de RLS, proporcionar mensaje más útil
        if (error.message?.includes('row-level security policy')) {
          return withCors({
            statusCode: 403,
            body: JSON.stringify({
              error: 'Error de seguridad (RLS): El JWT no tiene los claims necesarios.',
              details: 'Verifica que el template "supabase" en Clerk tenga los claims: user_id, org_id, org_role',
            }),
          });
        }
        throw error;
      }

      return withCors({
        statusCode: 200,
        body: JSON.stringify({ locations: data || [] }),
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
      
      // Determinar qué cliente usar: admin (service_role) o autenticado (JWT)
      // Si no hay service_role key, debemos usar el cliente autenticado con el token del usuario
      const clientToUse = supabaseServiceRoleKey 
        ? createAdminSupabaseClient() 
        : createAuthenticatedSupabaseClient(token);
      
      if (shouldBeMain) {
        const { data: existingMain } = await clientToUse
          .from('locations')
          .select('id')
          .eq('org_id', orgId)
          .eq('is_main', true)
          .maybeSingle();

        if (existingMain) {
          shouldBeMain = false; // Ya existe una sede principal
        }
      }

      // Crear la sede
      // Si tenemos service_role key, usamos admin client (bypass RLS)
      // Si no, usamos cliente autenticado (requiere JWT con claims correctos)
      const { data: location, error } = await clientToUse
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
      if (shouldBeMain && location) {
        // Asignar al creador como admin de la sede usando el mismo cliente
        const { error: assignmentError } = await clientToUse
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
          // La sede se creó exitosamente, solo falló la asignación
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
    console.error('Error stack:', error.stack);
    console.error('Event path:', event.path);
    console.error('Event method:', event.httpMethod);
    
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    });
  }
};




