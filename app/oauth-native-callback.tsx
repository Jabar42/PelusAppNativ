import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import LoadingScreen from '@/shared/components/LoadingScreen';

/**
 * Ruta de callback para OAuth nativo de Clerk.
 * Esta ruta maneja el redirect después de que el usuario completa
 * la autenticación OAuth con Google (u otros proveedores).
 */
export default function OAuthNativeCallback() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    // Si el usuario está autenticado, redirigir al flujo normal
    if (isSignedIn) {
      router.replace('/(initial)/loading');
    } else {
      // Si no está autenticado, redirigir al login
      router.replace('/(auth)/login');
    }
  }, [isLoaded, isSignedIn, router]);

  return <LoadingScreen />;
}

