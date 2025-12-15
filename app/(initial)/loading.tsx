import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useAuthStore } from '@/core/store/authStore';
import { useAuthSync } from '@/features/Auth/hooks/useAuthSync';

export default function InitialLoadingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { isLoading: authLoading, hasCompletedOnboarding, userRole } = useAuthStore();

  useAuthSync();

  useEffect(() => {
    if (!isLoaded || authLoading) return;

    if (!isSignedIn) {
      router.replace('/(initial)/role-select');
      return;
    }

    if (!hasCompletedOnboarding) {
      if (userRole === 'B2B') {
        router.replace('/(initial)/(onboarding)/b2b');
      } else {
        router.replace('/(initial)/(onboarding)/b2c');
      }
      return;
    }

    router.replace('/(tabs)');
  }, [isLoaded, authLoading, isSignedIn, hasCompletedOnboarding, userRole, router]);

  return <LoadingScreen />;
}

