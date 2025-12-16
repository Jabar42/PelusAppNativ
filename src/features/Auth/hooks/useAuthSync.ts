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
  const { pendingRole, setPendingRole } = useOnboardingStore();

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
      // Role exists in metadata - user is an existing user
      setUserRole(role);
      // Clear pendingRole since we have the role from metadata
      if (pendingRole) {
        setPendingRole(null);
      }
      // If hasOnboarding is undefined, assume true for existing users (webhook may not have run yet)
      // Only set to false if explicitly false in metadata
      if (hasOnboardingDefined) {
        setHasCompletedOnboarding(hasOnboardingValue);
      } else {
        // Metadata not set yet - assume user has completed onboarding if they have a role
        // This prevents redirecting existing users to onboarding
        setHasCompletedOnboarding(true);
      }
    } else if (pendingRole) {
      // No role in metadata yet, but user selected a role (webhook pending)
      // This indicates a NEW USER who just selected a role and authenticated
      // Use pendingRole temporarily until webhook sets metadata
      setUserRole(pendingRole);
      // CRITICAL: For new users with pendingRole, they haven't completed onboarding yet
      // Only set hasCompletedOnboarding to true if it's explicitly true in metadata
      // If undefined, assume false (new user needs to complete onboarding)
      if (hasOnboardingDefined) {
        setHasCompletedOnboarding(hasOnboardingValue);
      } else {
        // hasOnboarding is undefined - this is a new user, set to false
        // New users should go through onboarding unless webhook explicitly sets it to true
        setHasCompletedOnboarding(false);
      }
    } else {
      // No role in metadata and no pending role - fallback to B2C
      setUserRole('B2C');
      // Only set hasCompletedOnboarding to false if explicitly false in metadata
      // If undefined, assume true for authenticated users (they've likely completed onboarding)
      if (hasOnboardingDefined) {
        setHasCompletedOnboarding(hasOnboardingValue);
      } else {
        // For authenticated users without metadata, assume they've completed onboarding
        // This prevents redirecting existing users to onboarding
        setHasCompletedOnboarding(true);
      }
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoaded,
    userLoaded,
    isSignedIn,
    user?.id, // Only depend on user ID, not the whole user object
    user?.publicMetadata?.role,
    user?.publicMetadata?.hasCompletedOnboarding,
    pendingRole,
    // Store setters are stable, but we exclude them to avoid unnecessary re-runs
    // They're safe to use without being in deps
  ]);
}


