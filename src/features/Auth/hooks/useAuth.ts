import { useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';
import { UserRole } from '@/core/types/user';

/**
 * Hook que obtiene el rol del usuario desde Clerk metadata
 * y actualiza el Zustand store
 */
export function useAuth() {
  const { isLoaded, userId } = useClerkAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { setUserRole, setIsLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded || !userLoaded) {
      // Clerk aún está cargando
      setIsLoading(true);
      return;
    }

    if (!userId || !user) {
      // Usuario no autenticado
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    // Obtener rol desde metadata de Clerk
    const role = user.publicMetadata?.role as UserRole | undefined;

    if (role && (role === 'B2B' || role === 'B2C')) {
      setUserRole(role);
    } else {
      // Si no hay rol definido, default a B2C o manejar error
      console.warn('User role not found in metadata, defaulting to B2C');
      setUserRole('B2C');
    }

    setIsLoading(false);
  }, [isLoaded, userLoaded, userId, user, setUserRole, setIsLoading]);

  return {
    isLoaded,
    userId,
    user,
  };
}

