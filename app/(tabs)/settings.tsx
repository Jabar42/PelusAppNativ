import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { SettingsScreen as SettingsB2B } from '@/features/Business_Center/Veterinary/screens/SettingsScreen';
import { SettingsScreen as SettingsB2C } from '@/features/User_Space/screens/SettingsScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function SettingsScreen() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Renderizado condicional según el contexto (B2B o B2C)
  if (organization) {
    return <SettingsB2B />;
  }

  return <SettingsB2C />;
}
