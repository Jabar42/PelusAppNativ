import React from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  ScrollView, 
  HStack, 
  Avatar, 
  AvatarImage, 
  AvatarFallbackText,
  Center,
  Button,
  ButtonText,
  Pressable
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import WorkspaceManager from '../components/WorkspaceManager';
import { BRAND_NAME } from '@/core/config/brand';

export function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <ScrollView>
        <Box p="$6">
          {/* Header de Perfil */}
          <Center mb="$8">
            <Avatar size="xl" bg="$primary500">
              <AvatarFallbackText>{user?.fullName || user?.primaryEmailAddress?.emailAddress}</AvatarFallbackText>
              {user?.imageUrl && <AvatarImage source={{ uri: user.imageUrl }} alt="Profile Image" />}
            </Avatar>
            <Heading size="xl" mt="$4" color="$text900">
              {user?.fullName || `Usuario de ${BRAND_NAME}`}
            </Heading>
            <Text size="sm" color="$text500">
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </Center>

          {/* Gestor de Espacios (Switcher) */}
          <WorkspaceManager />

          {/* Menú de Opciones */}
          <VStack space="md" mt="$8">
            <Text size="sm" fontWeight="$bold" color="$text500" px="$1">
              AJUSTES DE CUENTA
            </Text>
            
            <VStack space="xs" bg="$backgroundLight50" borderRadius="$xl" p="$2">
              <ProfileMenuItem icon="person-outline" label="Editar Perfil" />
              <ProfileMenuItem icon="notifications-outline" label="Notificaciones" />
              <ProfileMenuItem icon="shield-checkmark-outline" label="Privacidad y Seguridad" />
            </VStack>
          </VStack>

          {/* Botón Cerrar Sesión */}
          <Button 
            variant="outline" 
            action="negative" 
            mt="$10" 
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

function ProfileMenuItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <Pressable>
      {({ pressed }) => (
        <HStack 
          p="$3" 
          space="md" 
          alignItems="center" 
          borderRadius="$lg"
          backgroundColor={pressed ? '$backgroundLight100' : 'transparent'}
        >
          <Ionicons name={icon} size={22} color="$text600" />
          <Text flex={1} size="md" color="$text800">{label}</Text>
          <Ionicons name="chevron-forward" size={18} color="$text400" />
        </HStack>
      )}
    </Pressable>
  );
}
