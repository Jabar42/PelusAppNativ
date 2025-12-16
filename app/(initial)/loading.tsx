import React, { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useAuthStore } from '@/core/store/authStore';
import { useOnboardingStore } from '@/core/store/onboardingStore';
import { useAuthSync } from '@/features/Auth/hooks/useAuthSync';

export default function InitialLoadingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { isLoading: authLoading, hasCompletedOnboarding, userRole } = useAuthStore();
  const { pendingRole } = useOnboardingStore();
  const hasNavigatedRef = useRef(false);
  const previousSignedInRef = useRef<boolean | undefined>(undefined);
  const previousHasCompletedRef = useRef<boolean | undefined>(undefined);
  const previousUserRoleRef = useRef<typeof userRole | undefined>(undefined);
  const previousPendingRoleRef = useRef<typeof pendingRole | undefined>(undefined);

  useAuthSync();

  // Reset navigation ref when authentication or critical auth state changes
  useEffect(() => {
    // 1) Cambio de estado de autenticación
    if (
      previousSignedInRef.current !== undefined &&
      previousSignedInRef.current !== isSignedIn
    ) {
      hasNavigatedRef.current = false;
    }

    // 2) Cambio en hasCompletedOnboarding (por ejemplo, webhook lo pone en true)
    if (
      previousHasCompletedRef.current !== undefined &&
      previousHasCompletedRef.current !== hasCompletedOnboarding
    ) {
      hasNavigatedRef.current = false;
    }

    // 3) Cambio en userRole (por ejemplo, webhook asigna rol definitivo)
    if (
      previousUserRoleRef.current !== undefined &&
      previousUserRoleRef.current !== userRole
    ) {
      hasNavigatedRef.current = false;
    }

    // 4) Cambio en pendingRole (por ejemplo, se limpia tras completar onboarding)
    if (
      previousPendingRoleRef.current !== undefined &&
      previousPendingRoleRef.current !== pendingRole
    ) {
      hasNavigatedRef.current = false;
    }

    // Actualizar refs previas
    previousSignedInRef.current = isSignedIn;
    previousHasCompletedRef.current = hasCompletedOnboarding;
    previousUserRoleRef.current = userRole;
    previousPendingRoleRef.current = pendingRole;
  }, [isSignedIn, hasCompletedOnboarding, userRole, pendingRole]);

  useEffect(() => {
    // Prevent multiple navigations
    if (hasNavigatedRef.current) return;
    
    // Wait for Clerk and auth store to be ready
    if (!isLoaded || authLoading) return;

    // Mark as navigating to prevent duplicate navigations
    hasNavigatedRef.current = true;

    if (!isSignedIn) {
      router.replace('/(initial)/role-select');
      return;
    }

    // Determine the effective role: use userRole from metadata if available,
    // otherwise fall back to pendingRole (user just selected but webhook hasn't run)
    const effectiveRole = userRole || pendingRole;

    // Check if userRole comes from pendingRole (new user) vs metadata (existing user)
    // If userRole === pendingRole, it means useAuthSync set it from pendingRole (no metadata yet)
    // If userRole !== pendingRole and userRole exists, it comes from metadata (existing user)
    const isNewUser = pendingRole && userRole === pendingRole;

    // Only redirect to onboarding if:
    // 1. User genuinely hasn't completed onboarding (hasCompletedOnboarding === false)
    // 2. AND we have a role to determine which onboarding screen to show
    // 3. AND this is a new user (pendingRole exists and userRole matches it, meaning no metadata yet)
    // This ensures new users go to onboarding, while existing users go to tabs
    if (!hasCompletedOnboarding && effectiveRole && isNewUser) {
      // Redirect new users to their onboarding screen based on selected role
      if (effectiveRole === 'B2B') {
        router.replace('/(initial)/(onboarding)/b2b');
      } else {
        router.replace('/(initial)/(onboarding)/b2c');
      }
      return;
    }

    // If user has completed onboarding OR is an existing user (has role in metadata or no pendingRole),
    // proceed to tabs. The tabs will handle loading states appropriately.
    router.replace('/(tabs)');
  }, [isLoaded, authLoading, isSignedIn, hasCompletedOnboarding, userRole, pendingRole, router]);

  return <LoadingScreen />;
}


