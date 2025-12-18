import { Handler } from '@netlify/functions';
import { Webhook } from 'svix';
import { UserJSON, WebhookEvent } from '@clerk/clerk-sdk-node';
import { processUserUpdate } from './utils/clerkService'; // Ruta relativa, sin alias

export const handler: Handler = async (event, context) => {
  // 1. Validar Método
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Verificar Firma (Seguridad Crítica)
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!CLERK_WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return { statusCode: 500, body: 'Server configuration error' };
  }

  const headers = {
    'svix-id': event.headers['svix-id'] as string,
    'svix-timestamp': event.headers['svix-timestamp'] as string,
    'svix-signature': event.headers['svix-signature'] as string,
  };

  const wh = new Webhook(CLERK_WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(event.body || '', headers) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return { statusCode: 400, body: 'Webhook Error: Verification failed' };
  }

  // 3. Procesar Evento
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, unsafe_metadata, public_metadata } = evt.data as UserJSON;
    
    // Check de seguridad para evitar bucles infinitos
    // Si ya tiene rol y completedOnboarding, no hacemos nada
    const currentRole = public_metadata?.role;
    const isOnboarded = public_metadata?.hasCompletedOnboarding;
    
    if (currentRole && isOnboarded) {
      console.log(`User ${id} already has role assigned. Skipping.`);
      return { statusCode: 200, body: JSON.stringify({ message: 'Already processed' }) };
    }

    const pendingRole = unsafe_metadata?.pendingRole;

    if (pendingRole && (pendingRole === 'B2B' || pendingRole === 'B2C')) {
      try {
        await processUserUpdate(id, pendingRole);
        return { statusCode: 200, body: JSON.stringify({ message: 'User role updated' }) };
      } catch (error) {
        console.error('Failed to update user role:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
      }
    } else {
      // No hay pendingRole aún (race condition) o es inválido
      // Retornamos 200 para que Clerk no reintente, esperamos un futuro user.updated
      console.log(`User ${id} has no pendingRole yet or invalid role. Waiting for client update.`);
      return { statusCode: 200, body: JSON.stringify({ message: 'No pending role found' }) };
    }
  }

  return { statusCode: 200, body: JSON.stringify({ message: 'Event type ignored' }) };
};












