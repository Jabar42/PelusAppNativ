import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { HelpScreen as HelpB2B } from '@/features/Business_Center/Veterinary/screens/HelpScreen';
import { HelpScreen as HelpB2C } from '@/features/User_Space/screens/HelpScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';

export default function HelpScreen() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Renderizado condicional según el contexto (B2B o B2C)
  if (organization) {
    return <HelpB2B />;
  }

  return <HelpB2C />;
}
