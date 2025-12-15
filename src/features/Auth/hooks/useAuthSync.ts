import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';
import { UserRole } from '@/core/types/user';

export function useAuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { setUserRole, setIsLoading, setHasCompletedOnboarding } =
    useAuthStore();

  useEffect(() => {
    if (!isLoaded || !userLoaded) {
      setIsLoading(true);
      return;
    }

    if (!isSignedIn || !user) {
      setUserRole(null);
      setHasCompletedOnboarding(false);
      setIsLoading(false);
      return;
    }

    const role = user.publicMetadata?.role as UserRole | undefined;
    const hasOnboarding = !!user.publicMetadata?.hasCompletedOnboarding;

    if (role === 'B2B' || role === 'B2C') {
      setUserRole(role);
    } else {
      // Fallback temporal mientras no haya rol en metadata
      setUserRole('B2C');
    }

    setHasCompletedOnboarding(hasOnboarding);
    setIsLoading(false);
  }, [
    isLoaded,
    userLoaded,
    isSignedIn,
    user,
    setUserRole,
    setHasCompletedOnboarding,
    setIsLoading,
  ]);
}

