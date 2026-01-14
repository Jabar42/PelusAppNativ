import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  ScrollView,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  Center,
  Button,
  ButtonText,
  Pressable,
  useToken,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser, useAuth, useOrganization } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import WorkspaceManager from '@/features/User_Space/components/WorkspaceManager';
import { BRAND_NAME } from '@/core/config/brand';
import SectionHeader from '@/features/Shared/components/SectionHeader';

function ProfileMenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  const text600 = useToken('colors', 'textLight600');
  const text400 = useToken('colors', 'textLight400');
  const iconLg = useToken('space', '6');
  const iconSm = useToken('space', '4');

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <HStack
          padding="$3"
          gap="$3"
          alignItems="center"
          borderRadius="$lg"
          backgroundColor={pressed ? '$backgroundLight100' : 'transparent'}
        >
          <Ionicons name={icon} size={iconLg} color={text600} />
          <Text flex={1} size="md" color="$text800">
            {label}
          </Text>
          <Ionicons name="chevron-forward" size={iconSm} color={text400} />
        </HStack>
      )}
    </Pressable>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { signOut } = useAuth();
  const iconLg = useToken('space', '6');
  const text600 = useToken('colors', 'textLight600');

  const handleNavigateToLocations = () => {
    // Navegar a pantalla de gestión de sedes
    // Por ahora usamos una ruta modal o stack
    router.push({
      pathname: '/locations-management',
    } as any);
  };

  const handleNavigateToAssignments = () => {
    // Navegar a pantalla de asignaciones
    router.push({
      pathname: '/location-assignments',
    } as any);
  };

  if (!userLoaded || !orgLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
        <Center flex={1}>
          <Text>Cargando...</Text>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <ScrollView>
        <Box padding="$6">
          {/* Header de Perfil */}
          <Center marginBottom="$8">
            <Avatar size="xl" backgroundColor="$primary500">
              <AvatarFallbackText>
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </AvatarFallbackText>
              {user?.imageUrl && (
                <AvatarImage source={{ uri: user.imageUrl }} alt="Profile Image" />
              )}
            </Avatar>
            <Heading size="xl" marginTop="$4" color="$text900">
              {user?.fullName || `Usuario de ${BRAND_NAME}`}
            </Heading>
            <Text size="sm" color="$text500">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </Center>

          {/* Información de Organización */}
          {organization && (
            <Box
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$primary50"
              borderWidth="$1"
              borderColor="$primary200"
              marginBottom="$6"
            >
              <HStack alignItems="center" gap="$3">
                <Box
                  width="$10"
                  height="$10"
                  borderRadius="$lg"
                  backgroundColor="$primary200"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons name="briefcase" size={iconLg} color={text600} />
                </Box>
                <VStack flex={1} gap="$1">
                  <Text size="sm" fontWeight="$semibold" color="$primary700">
                    Organización Activa
                  </Text>
                  <Text size="md" fontWeight="$bold" color="$primary900">
                    {organization.name}
                  </Text>
                  {organization.publicMetadata?.type ? (
                    <Text size="xs" color="$primary600">
                      Tipo: {String(organization.publicMetadata.type)}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Gestor de Espacios (Switcher) */}
          <WorkspaceManager />

          {/* Gestión de Negocio */}
          <VStack gap="$4" marginTop="$8">
            <SectionHeader
              title="Gestión de Negocio"
              subtitle="Administra tu organización"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$backgroundLight50" borderRadius="$xl" padding="$2">
              <ProfileMenuItem
                icon="location-outline"
                label="Gestión de Sedes"
                onPress={handleNavigateToLocations}
              />
              <ProfileMenuItem
                icon="people-outline"
                label="Asignaciones de Usuarios"
                onPress={handleNavigateToAssignments}
              />
              <ProfileMenuItem icon="settings-outline" label="Configuración del Negocio" />
            </VStack>
          </VStack>

          {/* Ajustes de Cuenta */}
          <VStack gap="$4" marginTop="$6">
            <SectionHeader
              title="Ajustes de Cuenta"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$backgroundLight50" borderRadius="$xl" padding="$2">
              <ProfileMenuItem icon="person-outline" label="Editar Perfil" />
              <ProfileMenuItem icon="notifications-outline" label="Notificaciones" />
              <ProfileMenuItem icon="shield-checkmark-outline" label="Privacidad y Seguridad" />
            </VStack>
          </VStack>

          {/* Botón Cerrar Sesión */}
          <Button
            variant="outline"
            action="negative"
            marginTop="$10"
            onPress={() => signOut()}
            borderColor="$error300"
          >
            <ButtonText color="$error600">Cerrar Sesión</ButtonText>
          </Button>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
