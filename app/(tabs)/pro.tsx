import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { ProfileScreen as ProfileB2B } from '@/features/Business_Center/Veterinary/screens/ProfileScreen';
import { ProfileScreen as ProfileB2C } from '@/features/User_Space/screens/ProfileScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function ProScreen() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Renderizado condicional según el contexto (B2B o B2C)
  if (organization) {
    return <ProfileB2B />;
  }

  return <ProfileB2C />;
}
