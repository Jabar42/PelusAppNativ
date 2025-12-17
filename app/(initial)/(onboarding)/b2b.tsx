import React, { useEffect } from 'react';
import { Box, Text, VStack, Button, ButtonText } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';

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
    <Box flex={1} className="bg-white dark:bg-black justify-center p-6">
      <VStack space="lg" alignItems="center">
        <Text className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
          PelusApp para Veterinarios
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-300 mb-8 text-center">
          Organiza tus pacientes, citas y recordatorios en un solo lugar.
        </Text>

        {isSignedIn ? (
          // Usuario autenticado pero no ha completado onboarding
          !hasCompletedOnboarding && (
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="bg-primary-500 w-full"
              onPress={handleContinue}
            >
              <ButtonText>Continuar</ButtonText>
            </Button>
          )
        ) : (
          // Usuario no autenticado - mostrar dos botones
          <VStack space="md" className="w-full">
            <Button
              size="md"
              variant="solid"
              action="primary"
              className="bg-primary-500 w-full"
              onPress={() => router.push('/(auth)/login')}
            >
              <ButtonText>Iniciar Sesión</ButtonText>
            </Button>
            <Button
              size="md"
              variant="outline"
              action="primary"
              className="border-primary-500 w-full"
              onPress={() => router.push('/(auth)/signup')}
            >
              <ButtonText className="text-primary-500">Registrarse</ButtonText>
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}


