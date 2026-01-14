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
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/features/Shared/components/SectionHeader';
import { BRAND_NAME } from '@/core/config/brand';

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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const primary600 = useToken('colors', 'primary600');
  const infoIconSize = useToken('space', '6');

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          <VStack gap="$2">
            <Heading size="2xl" color="$text900" fontWeight="$bold">
              Configuración
            </Heading>
            <Text size="md" color="$text600">
              Ajusta las preferencias de tu cuenta
            </Text>
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
                value={pushNotifications}
                onValueChange={setPushNotifications}
                description="Recibe notificaciones en tiempo real"
              />
              <SettingsToggle
                icon="mail-outline"
                label="Notificaciones por Email"
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                description="Recibe actualizaciones por correo electrónico"
              />
              <SettingsToggle
                icon="notifications"
                label="Todas las Notificaciones"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                description="Activa o desactiva todas las notificaciones"
              />
            </VStack>
          </VStack>

          {/* Cuenta */}
          <VStack gap="$4">
            <SectionHeader
              title="Cuenta"
              subtitle="Información y preferencias de tu cuenta"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsMenuItem icon="person-outline" label="Editar Perfil" />
              <SettingsMenuItem icon="lock-closed-outline" label="Cambiar Contraseña" />
              <SettingsMenuItem icon="mail-outline" label="Email" value="usuario@ejemplo.com" />
            </VStack>
          </VStack>

          {/* Privacidad y Seguridad */}
          <VStack gap="$4">
            <SectionHeader
              title="Privacidad y Seguridad"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsMenuItem icon="shield-checkmark-outline" label="Privacidad" />
              <SettingsMenuItem icon="key-outline" label="Seguridad" />
              <SettingsMenuItem icon="eye-outline" label="Visibilidad del Perfil" value="Público" />
            </VStack>
          </VStack>

          {/* Información de la App */}
          <VStack gap="$4">
            <SectionHeader
              title="Información"
              variant="compact"
            />

            <VStack gap="$1" backgroundColor="$white" borderRadius="$xl" padding="$2" borderWidth="$1" borderColor="$borderLight200">
              <SettingsMenuItem icon="information-circle-outline" label="Versión" value="1.0.0" showArrow={false} />
              <SettingsMenuItem icon="document-text-outline" label="Términos y Condiciones" />
              <SettingsMenuItem icon="shield-outline" label="Política de Privacidad" />
              <SettingsMenuItem icon="help-circle-outline" label="Soporte" />
            </VStack>
          </VStack>

          {/* Información de la App */}
          <Box
            padding="$4"
            borderRadius="$lg"
            backgroundColor="$primary50"
            borderWidth="$1"
            borderColor="$primary200"
          >
            <HStack alignItems="center" gap="$3">
              <Ionicons name="information-circle" size={infoIconSize} color={primary600} />
              <VStack flex={1} gap="$1">
                <Text size="sm" fontWeight="$semibold" color="$primary700">
                  {BRAND_NAME}
                </Text>
                <Text size="xs" color="$primary600">
                  Versión 1.0.0 • Desarrollado con ❤️
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
