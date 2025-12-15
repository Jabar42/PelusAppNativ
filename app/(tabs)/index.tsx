import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { HomeScreen as HomeB2B } from '@/features/B2B_Dashboard/screens/HomeScreen';
import { HomeScreen as HomeB2C } from '@/features/B2C_Shop/screens/HomeScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function IndexScreen() {
  const { userRole, isLoading } = useAuthStore();

  // CRÍTICO: Esperar explícitamente a que isLoading === false antes de renderizar
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Renderizar condicionalmente según el rol
  if (userRole === 'B2B') {
    return <HomeB2B />;
  }

  // Default a B2C
  return <HomeB2C />;
}
