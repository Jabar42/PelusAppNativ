import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading,
  Pressable, 
  Icon, 
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Button,
  ButtonText,
  Divider,
  Center,
  Spinner
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

/**
 * Gestor de Espacios de Trabajo (Workspace Manager).
 * Permite cambiar de organización o crear una nueva desde el perfil.
 * Utiliza un Actionsheet para una experiencia móvil limpia.
 */
export default function WorkspaceManager() {
  const router = useRouter();
  const { organization: activeOrg } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const [showActionsheet, setShowActionsheet] = useState(false);
  const handleClose = () => setShowActionsheet(false);

  const handleSwitchOrg = async (orgId: string | null) => {
    if (setActive) {
      await setActive({ organization: orgId });
      handleClose();
    }
  };

  const handleAddNewBusiness = () => {
    handleClose();
    // Reutilizamos el flujo de registro de negocio
    router.push('/(initial)/register-business');
  };

  if (!isLoaded) {
    return <Spinner color="$primary600" />;
  }

  const memberships = userMemberships.data || [];
  const hasOrganizations = memberships.length > 0;

  return (
    <Box width="$full" mt="$4">
      <VStack space="md">
        <Text size="sm" fontWeight="$bold" color="$text500" px="$1">
          MI ACTIVIDAD PROFESIONAL
        </Text>

        <Pressable onPress={() => setShowActionsheet(true)}>
          {({ pressed }) => (
            <Box
              p="$4"
              borderWidth="$1"
              borderColor="$borderLight200"
              borderRadius="$xl"
              backgroundColor={pressed ? '$backgroundLight50' : '$white'}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center">
                  <Center 
                    w="$10" 
                    h="$10" 
                    bg={activeOrg ? "$primary100" : "$backgroundLight100"} 
                    borderRadius="$lg"
                  >
                    <Ionicons 
                      name={activeOrg ? "briefcase" : "person"} 
                      size={20} 
                      color={activeOrg ? "$primary600" : "$text400"} 
                    />
                  </Center>
                  <VStack>
                    <Text fontWeight="$bold" size="md" color="$text900">
                      {activeOrg ? activeOrg.name : "Espacio Personal"}
                    </Text>
                    <Text size="xs" color="$text500">
                      {activeOrg ? "Modo Profesional Activo" : "Gestionando mis mascotas"}
                    </Text>
                  </VStack>
                </HStack>
                <Ionicons name="chevron-down" size={20} color="$text400" />
              </HStack>
            </Box>
          )}
        </Pressable>
      </VStack>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <VStack space="xs" p="$4" width="$full">
            <Heading size="md">Cambiar Espacio</Heading>
            <Text size="sm" color="$text500">Selecciona el negocio o perfil que quieres usar</Text>
          </VStack>

          <Divider />

          {/* Opción Perfil Personal */}
          <ActionsheetItem onPress={() => handleSwitchOrg(null)}>
            <HStack space="md" alignItems="center">
              <Ionicons name="person-outline" size={20} color={!activeOrg ? "$primary600" : "$text500"} />
              <ActionsheetItemText 
                fontWeight={!activeOrg ? "$bold" : "$normal"}
                color={!activeOrg ? "$primary700" : "$text900"}
              >
                Mi Perfil Personal (Dueño)
              </ActionsheetItemText>
            </HStack>
          </ActionsheetItem>

          {/* Lista de Organizaciones */}
          {memberships.map((membership) => (
            <ActionsheetItem 
              key={membership.organization.id} 
              onPress={() => handleSwitchOrg(membership.organization.id)}
            >
              <HStack space="md" alignItems="center">
                <Ionicons 
                  name="briefcase-outline" 
                  size={20} 
                  color={activeOrg?.id === membership.organization.id ? "$primary600" : "$text500"} 
                />
                <ActionsheetItemText
                  fontWeight={activeOrg?.id === membership.organization.id ? "$bold" : "$normal"}
                  color={activeOrg?.id === membership.organization.id ? "$primary700" : "$text900"}
                >
                  {membership.organization.name}
                </ActionsheetItemText>
              </HStack>
            </ActionsheetItem>
          ))}

          <Divider my="$2" />

          {/* Opción Añadir Negocio */}
          <ActionsheetItem onPress={handleAddNewBusiness}>
            <HStack space="md" alignItems="center">
              <Ionicons name="add-circle-outline" size={20} color="$primary600" />
              <ActionsheetItemText color="$primary600" fontWeight="$bold">
                Registrar nuevo negocio
              </ActionsheetItemText>
            </HStack>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}

