import { clerkClient } from '@clerk/clerk-sdk-node';

export async function processUserUpdate(userId: string, role: 'B2B' | 'B2C'): Promise<void> {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  
  if (!CLERK_SECRET_KEY) {
    throw new Error('Missing CLERK_SECRET_KEY');
  }

  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role,
        hasCompletedOnboarding: true,
      },
      unsafeMetadata: {
        // Limpiar pendingRole después de procesar
        pendingRole: null,
      },
    });
    
    console.log(`Successfully updated user ${userId} with role ${role}`);
  } catch (error) {
    console.error(`Failed to update user ${userId}:`, error);
    throw error;
  }
}








