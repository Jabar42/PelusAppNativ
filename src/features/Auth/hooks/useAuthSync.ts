import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';
import { useOnboardingStore } from '@/core/store/onboardingStore';
import { UserRole } from '@/core/types/user';

export function useAuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { setUserRole, setIsLoading, setHasCompletedOnboarding } =
    useAuthStore();
  const { pendingRole } = useOnboardingStore();

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
    const hasOnboarding = user.publicMetadata?.hasCompletedOnboarding;

    // Distinguish between "no metadata yet" vs "explicitly false"
    // If hasOnboarding is undefined, it means metadata hasn't been set by webhook yet
    // If hasOnboarding is explicitly false, user genuinely hasn't completed onboarding
    const hasOnboardingDefined = hasOnboarding !== undefined;
    const hasOnboardingValue = hasOnboarding === true;

    if (role === 'B2B' || role === 'B2C') {
      // Role exists in metadata - use it
      setUserRole(role);
      setHasCompletedOnboarding(hasOnboardingValue);
    } else if (pendingRole) {
      // No role in metadata yet, but user selected a role (webhook pending)
      // Use pendingRole temporarily until webhook sets metadata
      setUserRole(pendingRole);
      // Don't set hasCompletedOnboarding yet - wait for webhook
      // This prevents redirecting to onboarding when user just logged in
      setHasCompletedOnboarding(false);
    } else {
      // No role in metadata and no pending role - fallback to B2C
      setUserRole('B2C');
      // Only set hasCompletedOnboarding to false if it's explicitly false in metadata
      // If undefined, it means webhook hasn't run yet, so don't assume onboarding is incomplete
      setHasCompletedOnboarding(hasOnboardingDefined ? hasOnboardingValue : false);
    }

    setIsLoading(false);
  }, [
    isLoaded,
    userLoaded,
    isSignedIn,
    user,
    pendingRole,
    setUserRole,
    setHasCompletedOnboarding,
    setIsLoading,
  ]);
}


