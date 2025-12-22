import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Box, VStack, Heading, Text } from '@gluestack-ui/themed';
import { useAuthStore } from '@/core/store/authStore';
import Button from '@/shared/components/ui/Button/Button';

export default function B2BOnboardingScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useAuthStore();

  // Redirigir automáticamente si el usuario ya completó el onboarding
  useEffect(() => {
    if (isSignedIn && hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, hasCompletedOnboarding, router]);

  const handleContinue = async () => {
    // 1. Actualizar estado local - el useEffect manejará la navegación
    setHasCompletedOnboarding(true);

    // 2. Intentar persistir en metadata (opcional, buena práctica)
    if (user) {
      try {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            hasCompletedOnboarding: true,
          },
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
        // Continuamos de todos modos porque el estado local ya se actualizó
      }
    }
    // La navegación se maneja automáticamente por el useEffect cuando hasCompletedOnboarding cambia
  };

  return (
    <Box flex={1} backgroundColor="$white" justifyContent="center" p="$6">
      <VStack gap="$4" alignItems="center">
        <Heading size="xl" textAlign="center" color="$gray800">
          PelusApp para Veterinarios
        </Heading>
        <Text size="md" textAlign="center" color="$gray500" mb="$8">
          Organiza tus pacientes, citas y recordatorios en un solo lugar.
        </Text>

        {isSignedIn && !hasCompletedOnboarding ? (
          <Button width="$full" onPress={handleContinue}>
            Continuar
          </Button>
        ) : !isSignedIn ? (
          <VStack gap="$3" width="$full">
            <Button width="$full" onPress={() => router.push('/(auth)/login')}>
              Iniciar Sesión
            </Button>
            <Button 
              width="$full" 
              variant="outline" 
              onPress={() => router.push('/(auth)/signup')}
            >
              Registrarse
            </Button>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
