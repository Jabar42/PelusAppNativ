import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { SettingsScreen as SettingsB2B } from '@/features/B2B_Dashboard/screens/SettingsScreen';
import { SettingsScreen as SettingsB2C } from '@/features/B2C_Shop/screens/SettingsScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function SettingsScreen() {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (userRole === 'B2B') {
    return <SettingsB2B />;
  }

  return <SettingsB2C />;
}
