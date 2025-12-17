import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setPendingRole } = useOnboardingStore();

  const handleSelect = (role: 'B2B' | 'B2C') => {
    setPendingRole(role);
    if (role === 'B2B') {
      router.push('/(initial)/(onboarding)/b2b');
    } else {
      router.push('/(initial)/(onboarding)/b2c');
    }
  };

  return (
    <Box flex={1} className="bg-white dark:bg-black justify-center p-6">
      <VStack space="lg">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          ¿Cómo quieres usar PelusApp?
        </Text>

        <Pressable onPress={() => handleSelect('B2B')}>
          <Box className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900 mb-4">
            <Text className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
              Soy veterinario
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Gestiona tu clínica, pacientes y recordatorios.
            </Text>
          </Box>
        </Pressable>

        <Pressable onPress={() => handleSelect('B2C')}>
          <Box className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900 mb-4">
            <Text className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
              Soy dueño de mascotas
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Controla vacunas, citas y bienestar de tus peludos.
            </Text>
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}


