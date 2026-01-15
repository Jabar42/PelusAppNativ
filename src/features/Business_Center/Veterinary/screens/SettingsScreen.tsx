import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Switch,
  Pressable,
  useToken,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrganization, useOrganizationList } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/features/Shared/components/SectionHeader';

function SettingsMenuItem({
  icon,
  label,
  value,
  onPress,
  showArrow = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
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
          <VStack flex={1} gap="$1">
            <Text size="md" color="$text800">
              {label}
            </Text>
            {value && (
              <Text size="xs" color="$text500">
                {value}
              </Text>
            )}
          </VStack>
          {showArrow && (
            <Ionicons name="chevron-forward" size={iconSm} color={text400} />
          )}
        </HStack>
      )}
    </Pressable>
  );
}

function SettingsToggle({
  icon,
  label,
  value,
  onValueChange,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}) {
  const text600 = useToken('colors', 'textLight600');
  const iconLg = useToken('space', '6');

  return (
    <HStack
      padding="$3"
      gap="$3"
      alignItems="center"
      borderRadius="$lg"
      justifyContent="space-between"
    >
      <HStack flex={1} gap="$3" alignItems="center">
        <Ionicons name={icon} size={iconLg} color={text600} />
        <VStack flex={1} gap="$1">
          <Text size="md" color="$text800">
            {label}
          </Text>
          {description && (
            <Text size="xs" color="$text500">
              {description}
            </Text>
          )}
        </VStack>
      </HStack>
      <Switch value={value} onValueChange={onValueChange} size="sm" />
    </HStack>
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { userMemberships } = useOrganizationList();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const currentMembership = userMemberships?.data?.find(
    (membership) => membership.organization.id === organization?.id
  );
  const canManageLocations =
    currentMembership?.role === 'admin' || currentMembership?.role === 'owner';

  const handleNavigateToLocations = () => {
    router.push({
      pathname: '/locations-management',
    } as any);
  };

  const handleNavigateToAssignments = () => {
    router.push({
      pathname: '/location-assignments',
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          <VStack gap="$2">
            <Heading size="2xl" color="$text900" fontWeight="$bold">
              Configuración del Negocio
            </Heading>
            <Text size="md" color="$text600">
              {organization?.name || 'Organización'}
            </Text>
          </VStack>

          {/* Gestión de Negocio */}
          <VStack gap="$4">
            <SectionHeader
              title="Gestión de Negocio"
              subtitle="Administra tu organización y sedes"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              {canManageLocations && (
                <SettingsMenuItem
                  icon="location-outline"
                  label="Gestión de Sedes"
                  onPress={handleNavigateToLocations}
                />
              )}
              <SettingsMenuItem
                icon="people-outline"
                label="Asignaciones de Usuarios"
                onPress={handleNavigateToAssignments}
              />
              <SettingsMenuItem icon="business-outline" label="Información del Negocio" />
              <SettingsMenuItem icon="card-outline" label="Plan y Facturación" />
            </VStack>
          </VStack>

          {/* Notificaciones */}
          <VStack gap="$4">
            <SectionHeader
              title="Notificaciones"
              subtitle="Gestiona cómo recibes notificaciones"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsToggle
                icon="notifications-outline"
                label="Notificaciones Push"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                description="Recibe notificaciones en tiempo real"
              />
              <SettingsToggle
                icon="mail-outline"
                label="Notificaciones por Email"
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                description="Recibe actualizaciones por correo electrónico"
              />
            </VStack>
          </VStack>

          {/* Datos y Seguridad */}
          <VStack gap="$4">
            <SectionHeader
              title="Datos y Seguridad"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsToggle
                icon="cloud-upload-outline"
                label="Respaldo Automático"
                value={autoBackup}
                onValueChange={setAutoBackup}
                description="Respalda tus datos automáticamente"
              />
              <SettingsMenuItem icon="shield-checkmark-outline" label="Seguridad" />
              <SettingsMenuItem icon="lock-closed-outline" label="Permisos de Acceso" />
            </VStack>
          </VStack>

          {/* Información */}
          <VStack gap="$4">
            <SectionHeader
              title="Información"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsMenuItem icon="document-text-outline" label="Términos y Condiciones" />
              <SettingsMenuItem icon="shield-outline" label="Política de Privacidad" />
              <SettingsMenuItem icon="help-circle-outline" label="Soporte Profesional" />
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
