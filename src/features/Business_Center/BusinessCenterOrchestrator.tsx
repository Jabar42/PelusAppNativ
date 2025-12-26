import React from 'react';
import { useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import { HomeScreen as VeterinaryHome } from './Veterinary/screens/HomeScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { Box, Text, Center, Button, ButtonText, HStack, Heading, VStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

/**
 * Orquestador del Business Center.
 * Decide qué módulo profesional cargar basado en el metadata de la organización activa.
 */
export default function BusinessCenterOrchestrator() {
  const { organization, isLoaded } = useOrganization();
  const { setActive } = useOrganizationList();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  if (!organization) {
    return (
      <Center flex={1}>
        <Text>No se encontró una organización activa.</Text>
      </Center>
    );
  }

  // SANEAMIENTO: Leer exclusivamente de publicMetadata (Backend-driven)
  const businessType = organization.publicMetadata?.type as string | undefined;

  const handleSwitchToPersonal = async () => {
    if (setActive) {
      await setActive({ organization: null });
    }
  };

  return (
    <Box flex={1}>
      <HStack 
        backgroundColor="$primary600" 
        paddingVertical="$2" 
        paddingHorizontal="$4" 
        justifyContent="space-between" 
        alignItems="center"
      >
        <HStack alignItems="center" gap="$2">
          <Ionicons name="briefcase" size={16} color="white" />
          <Text color="white" fontSize="$xs" fontWeight="$bold">
            MODO PROFESIONAL: {organization.name}
          </Text>
        </HStack>
        <Button 
          variant="outline" 
          action="primary" 
          size="xs" 
          borderColor="white" 
          onPress={handleSwitchToPersonal}
        >
          <ButtonText color="white" fontSize="$xs">Ver como Dueño</ButtonText>
        </Button>
      </HStack>

      <Box flex={1}>
        {/* Si no hay tipo aún, mostramos un mensaje de advertencia o configuración incompleta */}
        {!businessType ? (
          <Center flex={1} p="$6">
            <VStack space="md" alignItems="center">
              <Ionicons name="construct-outline" size={48} color="$warning600" />
              <Heading size="md" textAlign="center">Configuración Incompleta</Heading>
              <Text textAlign="center" color="$text600">
                Este espacio de trabajo no ha sido configurado correctamente.
              </Text>
              <Button action="secondary" variant="outline" onPress={handleSwitchToPersonal}>
                <ButtonText>Volver al perfil personal</ButtonText>
              </Button>
            </VStack>
          </Center>
        ) : businessType === 'veterinary' ? (
          <VeterinaryHome />
        ) : (
          <Center flex={1}>
            <Text>Módulo {businessType} no implementado aún.</Text>
          </Center>
        )}
      </Box>
    </Box>
  );
}
