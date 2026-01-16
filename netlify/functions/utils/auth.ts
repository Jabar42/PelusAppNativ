/**
 * Auth Utilities for AI Functions
 * Manejo de autenticación y extracción de contexto JWT
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { clerkClient } from '@clerk/clerk-sdk-node';

export interface AIContext {
  userId: string;
  orgId?: string;
  activeLocationId?: string;
  userType: 'pet_owner' | 'professional';
  role?: string;
}

/**
 * Extrae el contexto de seguridad del JWT de Clerk
 */
export async function extractAIContext(event: HandlerEvent): Promise<AIContext | null> {
  const authHeader = event.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[AI Auth] Missing or invalid authorization header');
    return null;
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token con Clerk
    // Nota: Clerk SDK automáticamente valida la firma del JWT
    const payload = await clerkClient.verifyToken(token);
    
    if (!payload.sub) {
      console.error('[AI Auth] Token missing sub claim');
      return null;
    }

    // Obtener metadata del usuario
    const user = await clerkClient.users.getUser(payload.sub);
    
    // Obtener organización si existe org_id en el JWT
    let activeLocationId: string | undefined;
    if (payload.org_id) {
      try {
        const organization = await clerkClient.organizations.getOrganization({
          organizationId: payload.org_id as string,
        });
        activeLocationId = organization.publicMetadata?.active_location_id as string | undefined;
      } catch (error) {
        console.warn('[AI Auth] Could not fetch organization:', error);
        // Continuar sin activeLocationId si falla
      }
    }
    
    const context: AIContext = {
      userId: payload.sub,
      orgId: payload.org_id as string | undefined,
      activeLocationId,
      userType: (user.publicMetadata?.user_type as 'pet_owner' | 'professional') || 'pet_owner',
      role: payload.org_role as string | undefined,
    };

    return context;
  } catch (error: any) {
    console.error('[AI Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Middleware para validar autenticación en functions de IA
 */
export function withAIAuth(handler: (event: HandlerEvent, context: AIContext) => Promise<any>): Handler {
  return async (event) => {
    // Manejar preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        } as Record<string, string>,
        body: '',
      };
    }

    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Extraer contexto
    const context = await extractAIContext(event);
    
    if (!context) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Ejecutar handler con contexto
    try {
      const result = await handler(event, context);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(result),
      };
    } catch (error: any) {
      console.error('[AI Function Error]:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: error.message || 'Internal server error' 
        }),
      };
    }
  };
}
