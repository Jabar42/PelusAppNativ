import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { ProfileScreen as ProfileB2B } from '@/features/B2B_Dashboard/screens/ProfileScreen';
import { ProfileScreen as ProfileB2C } from '@/features/B2C_Shop/screens/ProfileScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function ProScreen() {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (userRole === 'B2B') {
    return <ProfileB2B />;
  }

  return <ProfileB2C />;
}
