import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Pressable, 
  HStack, 
  Spinner,
  Center
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { UserType } from '@/core/types/user';
import { apiClient } from '@/core/services/api';

export default function ProfessionalInquiryScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelection = async (type: UserType) => {
    if (!user || !isLoaded) return;

    setIsLoading(true);
    try {
      // 1. Obtener el token de sesión de Clerk
      const token = await getToken();

      // 2. Llamar a nuestra API segura en el backend
      const response = await apiClient.post('/complete-onboarding', {
        userId: user.id,
        userType: type,
      }, token || undefined);

      if (response.error) {
        throw new Error(response.error);
      }

      // 3. Forzar refresco de la sesión para obtener los nuevos metadatos
      await user.reload();

      // 4. Redirección condicional según la elección
      if (type === 'professional') {
        router.replace('/(initial)/register-business');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      setIsLoading(false);
      // Aquí se podría mostrar un toast de error
    }
  };

  if (isLoading) {
    return (
      <Center flex={1} backgroundColor="$white">
        <Spinner size="large" color="$primary600" />
        <Text mt="$4" color="$text500">Configurando tu perfil de forma segura...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} backgroundColor="$white" justifyContent="center" p="$6">
      <VStack space="xl" width="$full" maxWidth={400} alignSelf="center">
        <VStack space="xs" mb="$4">
          <Heading size="2xl" color="$text900" textAlign="center">
            ¡Ya casi estamos!
          </Heading>
          <Text size="md" color="$text500" textAlign="center">
            Ayúdanos a personalizar tu experiencia en PelusApp
          </Text>
        </VStack>

        <VStack space="md">
          {/* Opción Dueño de Mascota */}
          <Pressable onPress={() => handleSelection('pet_owner')}>
            {({ pressed }) => (
              <Box
                p="$5"
                borderWidth="$2"
                borderColor={pressed ? '$primary600' : '$borderLight200'}
                borderRadius="$xl"
                backgroundColor={pressed ? '$primary50' : '$white'}
              >
                <HStack space="md" alignItems="center">
                  <Center w="$12" h="$12" bg="$primary100" borderRadius="$full">
                    <Ionicons name="paw" size={24} color="$primary600" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="$bold" size="lg" color="$text900">
                      Soy dueño de mascota
                    </Text>
                    <Text size="sm" color="$text500">
                      Quiero gestionar las vacunas y citas de mis peludos.
                    </Text>
                  </VStack>
                  <Ionicons name="chevron-forward" size={20} color="$text400" />
                </HStack>
              </Box>
            )}
          </Pressable>

          {/* Opción Profesional */}
          <Pressable onPress={() => handleSelection('professional')}>
            {({ pressed }) => (
              <Box
                p="$5"
                borderWidth="$2"
                borderColor={pressed ? '$primary600' : '$borderLight200'}
                borderRadius="$xl"
                backgroundColor={pressed ? '$primary50' : '$white'}
              >
                <HStack space="md" alignItems="center">
                  <Center w="$12" h="$12" bg="$blue100" borderRadius="$full">
                    <Ionicons name="medical" size={24} color="$blue600" />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="$bold" size="lg" color="$text900">
                      Ofrezco servicios
                    </Text>
                    <Text size="sm" color="$text500">
                      Soy veterinario, paseador o peluquero profesional.
                    </Text>
                  </VStack>
                  <Ionicons name="chevron-forward" size={20} color="$text400" />
                </HStack>
              </Box>
            )}
          </Pressable>
        </VStack>
      </VStack>
    </Box>
  );
}
