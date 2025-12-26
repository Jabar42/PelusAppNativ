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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useAuthSync.ts:17',message:'Auth Sync State Update',data:{isLoaded, isSignedIn, userId: user?.id, userLoaded, authStoreLoading: useAuthStore.getState().isLoading},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
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
