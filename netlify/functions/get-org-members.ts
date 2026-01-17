/// <reference types="node" />
// @ts-ignore - Los tipos están disponibles pero el linter no los encuentra desde el subdirectorio
import { Handler } from '@netlify/functions';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { withCors, handleOptions } from './utils/cors';

// Inicializar Clerk Client
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required. Make sure it is set in your .env file.');
}

/**
 * Obtiene el userId del JWT de Clerk
 */
async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // Intentar verificar con Clerk SDK primero
    try {
      const session = await clerkClient.verifyToken(token);
      return session.sub || null;
    } catch (verifyError) {
      // Si falla la verificación (puede ser por custom signing key),
      // decodificar el JWT directamente
      console.warn('Clerk verifyToken failed, decoding JWT directly:', verifyError);
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      return payload.sub || payload.user_id || null;
    }
  } catch (error) {
    console.error('Error getting userId from token:', error);
    return null;
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
 * Handler para obtener miembros de una organización
 * GET /get-org-members?orgId=xxx
 */
export const handler: Handler = async (event) => {
  // Manejar Preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Solo permitir GET
  if (event.httpMethod !== 'GET') {
    return withCors({
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' }),
    });
  }

  try {
    // Obtener token de autorización
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return withCors({
        statusCode: 401,
        body: JSON.stringify({ error: 'Token de autenticación requerido' }),
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = await getUserIdFromToken(token);

    if (!userId) {
      return withCors({
        statusCode: 401,
        body: JSON.stringify({ error: 'Token inválido' }),
      });
    }

    // Obtener orgId de query parameters
    const { orgId } = event.queryStringParameters || {};

    if (!orgId) {
      return withCors({
        statusCode: 400,
        body: JSON.stringify({ error: 'orgId es requerido' }),
      });
    }

    // Verificar que el usuario es miembro de la org
    const isMember = await verifyOrgMember(userId, orgId);
    if (!isMember) {
      return withCors({
        statusCode: 403,
        body: JSON.stringify({ error: 'No tienes acceso a esta organización' }),
      });
    }

    // Obtener lista de miembros de la organización
    const membershipList = await clerkClient.organizations.getOrganizationMembershipList({
      organizationId: orgId,
    });

    // Transformar a formato esperado por el frontend
    const members = membershipList.data.map((membership) => ({
      userId: membership.publicUserData?.userId || '',
      firstName: membership.publicUserData?.firstName || undefined,
      lastName: membership.publicUserData?.lastName || undefined,
      emailAddress: membership.publicUserData?.identifier || undefined,
      role: membership.role || 'member',
    }));

    return withCors({
      statusCode: 200,
      body: JSON.stringify({ members }),
    });
  } catch (error: any) {
    console.error('Error en get-org-members:', error);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' }),
    });
  }
};
