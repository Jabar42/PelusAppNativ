import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { HelpScreen as HelpB2B } from '@/features/B2B_Dashboard/screens/HelpScreen';
import { HelpScreen as HelpB2C } from '@/features/B2C_Shop/screens/HelpScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function HelpScreen() {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (userRole === 'B2B') {
    return <HelpB2B />;
  }

  return <HelpB2C />;
}
