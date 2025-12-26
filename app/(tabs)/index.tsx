import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';
import { HomeScreen as HomeB2C } from '@/features/User_Space/screens/HomeScreen';
import BusinessCenterOrchestrator from '@/features/Business_Center/BusinessCenterOrchestrator';
import LoadingScreen from '@/shared/components/LoadingScreen';

/**
 * Pantalla principal del sistema de Tabs.
 * Actúa como el Switcher de Contexto Maestro (Identidad Unificada).
 */
export default function IndexScreen() {
  const { isLoading: authLoading } = useAuthStore();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  // 1. Esperar a que Clerk y nuestro store estén listos
  if (authLoading || !orgLoaded) {
    return <LoadingScreen />;
  }

  /**
   * 2. Lógica de "Contexto Activo":
   * - Si hay una organización activa en Clerk, estamos en modo profesional (B2B).
   * - Si no hay organización activa, estamos en modo personal (B2C).
   */
  if (organization) {
    return <BusinessCenterOrchestrator />;
  }

  // Por defecto: Espacio Personal (B2C)
  return <HomeB2C />;
}
