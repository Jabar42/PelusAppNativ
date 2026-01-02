import { clerkClient } from '@clerk/clerk-sdk-node';
import { Handler } from '@netlify/functions';
import { withCors, handleOptions } from './utils/cors';

// Inicializar Clerk Client con la secret key del entorno
// Netlify Dev carga las variables de .env automáticamente
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required. Make sure it is set in your .env file.');
}

/**
 * Función para actualizar los metadatos de una organización de forma segura.
 * Establece el tipo de negocio en publicMetadata.
 */
export const handler: Handler = async (event) => {
  // Manejar Preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return withCors({ statusCode: 405, body: 'Method Not Allowed' });
  }

  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return withCors({ statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) });
  }

  try {
    const { orgId, type } = JSON.parse(event.body || '{}');

    if (!orgId || !type) {
      return withCors({ 
        statusCode: 400, 
        body: JSON.stringify({ error: 'orgId y type son requeridos' }) 
      });
    }

    // 1. Actualizar publicMetadata de la organización (Seguro)
    // Nota: Las organizaciones no soportan unsafeMetadata en la API de Clerk
    await clerkClient.organizations.updateOrganizationMetadata(orgId, {
      publicMetadata: {
        type: type,
      },
    });

    return withCors({
      statusCode: 200,
      body: JSON.stringify({ message: 'Metadatos de organización actualizados' }),
    });
  } catch (error: any) {
    console.error('Error en update-org-metadata:', error);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' }),
    });
  }
};
