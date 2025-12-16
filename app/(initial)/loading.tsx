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

  useAuthSync();

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

    // Only redirect to onboarding if:
    // 1. User genuinely hasn't completed onboarding (hasCompletedOnboarding === false)
    // 2. AND we have a role to determine which onboarding screen to show
    // This prevents redirecting when metadata hasn't been set by webhook yet
    if (!hasCompletedOnboarding && effectiveRole) {
      if (effectiveRole === 'B2B') {
        router.replace('/(initial)/(onboarding)/b2b');
      } else {
        router.replace('/(initial)/(onboarding)/b2c');
      }
      return;
    }

    // If user has completed onboarding OR we don't have role info yet (waiting for webhook),
    // proceed to tabs. The tabs will handle loading states appropriately.
    router.replace('/(tabs)');
  }, [isLoaded, authLoading, isSignedIn, hasCompletedOnboarding, userRole, pendingRole]);

  return <LoadingScreen />;
}


