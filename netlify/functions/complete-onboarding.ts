import { clerkClient } from '@clerk/clerk-sdk-node';
import { Handler } from '@netlify/functions';
import { withCors, handleOptions } from './utils/cors';

// Inicializar Clerk Client con la secret key del entorno
// Netlify Dev carga las variables de .env automáticamente
if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required. Make sure it is set in your .env file.');
}

/**
 * Función para completar el onboarding de un usuario de forma segura.
 * Establece user_type y hasCompletedOnboarding en publicMetadata.
 */
export const handler: Handler = async (event) => {
  // Manejar Preflight (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Solo permitir peticiones POST
  if (event.httpMethod !== 'POST') {
    return withCors({ statusCode: 405, body: 'Method Not Allowed' });
  }

  // 1. Verificar el token de autorización (JWT de Clerk)
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return withCors({ statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) });
  }

  try {
    const { userId, userType } = JSON.parse(event.body || '{}');
    console.log(`[complete-onboarding] Procesando reparación para usuario: ${userId}, tipo: ${userType}`);

    if (!userId || !userType) {
      return withCors({ 
        statusCode: 400, 
        body: JSON.stringify({ error: 'userId y userType son requeridos' }) 
      });
    }

    // 2. Actualizar publicMetadata (Seguro)
    console.log('[complete-onboarding] Llamando a clerkClient.users.updateUserMetadata...');
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        user_type: userType,
        hasCompletedOnboarding: true,
      },
    });

    console.log('[complete-onboarding] Sincronización exitosa en Clerk.');

    return withCors({
      statusCode: 200,
      body: JSON.stringify({ message: 'Onboarding completado con éxito' }),
    });
  } catch (error: any) {
    console.error('Error en complete-onboarding:', error);
    return withCors({
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Error interno del servidor' }),
    });
  }
};
