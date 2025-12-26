import React from 'react';
import { useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import { HomeScreen as VeterinaryHome } from './Veterinary/screens/HomeScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { Box, Text, Center, Button, ButtonText, HStack, Icon } from '@gluestack-ui/themed';
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

  // Leer el tipo de negocio desde publicMetadata
  const businessType = organization.publicMetadata?.type as string;

  /**
   * Función para volver al modo personal (B2C).
   * Desactiva la organización actual en Clerk.
   */
  const handleSwitchToPersonal = async () => {
    if (setActive) {
      await setActive({ organization: null });
    }
  };

  return (
    <Box flex={1}>
      {/* Banner de Contexto Profesional con opción de Switch */}
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

      {/* Renderizado del módulo específico */}
      <Box flex={1}>
        {businessType === 'veterinary' || !businessType ? (
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
