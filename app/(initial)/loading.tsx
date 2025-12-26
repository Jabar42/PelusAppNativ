import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useAuthStore } from '@/core/store/authStore';

/**
 * Orquestador de carga inicial (El "Recepcionista").
 * Implementa la lógica de segmentación del flujo:
 * 1. No logueado -> Login Universal.
 * 2. Logueado pero sin segmentar (user_type) -> Professional Inquiry.
 * 3. Segmentado -> Dashboard (Tabs).
 */
export default function InitialLoadingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const { isLoading: authLoading } = useAuthStore();
  
  const hasNavigatedRef = useRef(false);
  const previousSignedInRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (
      previousSignedInRef.current !== undefined &&
      previousSignedInRef.current !== isSignedIn
    ) {
      hasNavigatedRef.current = false;
    }
    previousSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    if (!isLoaded || !userLoaded || authLoading) return;

    hasNavigatedRef.current = true;

    if (!isSignedIn) {
      router.replace('/(auth)/login');
      return;
    }

    // SANEAMIENTO: Leer exclusivamente de publicMetadata (Backend-driven)
    // Ignoramos unsafeMetadata por seguridad.
    const userType = user?.publicMetadata?.user_type as string | undefined;

    if (!userType) {
      // Si no tiene definido el tipo de usuario de forma segura, llevar a la pregunta inicial
      router.replace('/(initial)/professional-inquiry');
      return;
    }

    // 3. Caso: Usuario segmentado, ir al Dashboard principal
    router.replace('/(tabs)');
    
  }, [isLoaded, userLoaded, authLoading, isSignedIn, user?.publicMetadata?.user_type, router]);

  return <LoadingScreen />;
}
