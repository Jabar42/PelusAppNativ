import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';

/**
 * Hook para sincronizar el estado de autenticación de Clerk con el store local.
 * En el nuevo modelo de Identidad Unificada, este hook solo se encarga de:
 * 1. Gestionar el estado de carga global.
 * 2. Sincronizar flags básicos del perfil universal (como onboarding completado).
 */
export function useAuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { setIsLoading, setHasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    // 1. Esperar a que Clerk cargue los datos básicos
    if (!isLoaded || !userLoaded) {
      setIsLoading(true);
      return;
    }

    // 2. Si no hay sesión, resetear estado y terminar
    if (!isSignedIn || !user) {
      setHasCompletedOnboarding(false);
      setIsLoading(false);
      return;
    }

    // 3. Sincronizar metadatos del perfil universal
    // Usamos hasCompletedOnboarding para saber si el usuario ya llenó sus datos personales (B2C)
    const hasOnboarding = user.publicMetadata?.hasCompletedOnboarding === true;
    setHasCompletedOnboarding(hasOnboarding);

    // 4. Marcar carga como finalizada
    setIsLoading(false);
    
  }, [
    isLoaded,
    userLoaded,
    isSignedIn,
    user?.id,
    user?.publicMetadata?.hasCompletedOnboarding,
    setIsLoading,
    setHasCompletedOnboarding
  ]);
}
