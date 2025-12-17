import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { FavoritesScreen } from '@/features/B2C_Shop/screens/FavoritesScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { Box, Text, VStack, Center } from '@gluestack-ui/themed';

export default function FavScreen() {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Only B2C users can access favorites
  if (userRole !== 'B2C') {
    return (
      <Box flex={1} className="bg-gray-100 dark:bg-gray-900 justify-center p-6">
        <Center>
          <VStack space="sm" alignItems="center">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acceso no autorizado
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400 text-center">
              Esta sección está disponible solo para clientes.
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return <FavoritesScreen />;
}
