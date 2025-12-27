import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useUser, useAuth, useOrganization } from '@clerk/clerk-expo';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Avatar, 
  AvatarImage, 
  AvatarFallbackText, 
  Pressable,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Divider,
  Icon,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import WorkspaceManager from '@/features/User_Space/components/WorkspaceManager';

/**
 * UserAvatarHeader
 * Componente para el Header Right que muestra el avatar del usuario
 * y despliega un menú de gestión de cuenta y contextos.
 */
export default function UserAvatarHeader() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { organization } = useOrganization();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      setShowMenu(false);
      // Navegamos inmediatamente a la raíz para que el orquestador InitialLoadingScreen
      // tome el control y nos mande al login sin parpadeos en las pestañas.
      router.replace('/');
      await signOut();
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  const goToSettings = () => {
    setShowMenu(false);
    router.push('/(tabs)/settings');
  };

  return (
    <Box paddingRight="$4">
      <Pressable onPress={() => setShowMenu(true)}>
        <Avatar size="sm" bg="$primary500">
          <AvatarFallbackText>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</AvatarFallbackText>
          {user?.imageUrl && <AvatarImage source={{ uri: user.imageUrl }} alt="Profile" />}
        </Avatar>
      </Pressable>

      <Actionsheet isOpen={showMenu} onClose={() => setShowMenu(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <VStack width="$full" padding="$4" gap="$4">
            {/* Info de Usuario */}
            <HStack gap="$3" alignItems="center">
              <Avatar size="md" bg="$primary500">
                <AvatarFallbackText>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</AvatarFallbackText>
                {user?.imageUrl && <AvatarImage source={{ uri: user.imageUrl }} alt="Profile" />}
              </Avatar>
              <VStack>
                <Text fontWeight="$bold" size="md" color="$text900">
                  {user?.fullName || 'Usuario'}
                </Text>
                <Text size="xs" color="$text500">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </VStack>
            </HStack>

            <Divider />

            {/* Gestor de Espacios integrado */}
            <WorkspaceManager />

            <Divider />

            {/* Opciones Adicionales */}
            <VStack gap="$2">
              <ActionsheetItem onPress={goToSettings}>
                <HStack gap="$3" alignItems="center">
                  <Ionicons name="settings-outline" size={20} color="$text500" />
                  <ActionsheetItemText>Configuración</ActionsheetItemText>
                </HStack>
              </ActionsheetItem>

              <ActionsheetItem onPress={handleSignOut}>
                <HStack gap="$3" alignItems="center">
                  <Ionicons name="log-out-outline" size={20} color="$error600" />
                  <ActionsheetItemText color="$error600">Cerrar Sesión</ActionsheetItemText>
                </HStack>
              </ActionsheetItem>
            </VStack>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}

