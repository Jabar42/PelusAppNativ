import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Center,
  Pressable,
  useToken,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOrganization } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import EmptyState from '@/features/Shared/components/EmptyState';
import InfoCard from '@/features/Shared/components/InfoCard';
import SectionHeader from '@/features/Shared/components/SectionHeader';
import { LoadingSkeletonCard } from '@/features/Shared/components/LoadingSkeleton';

interface Location {
  id: string;
  name: string;
  is_main: boolean;
}

export function HomeScreen() {
  const router = useRouter();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const supabase = useSupabaseClient();
  const iconMd = useToken('space', '6');
  const warning600 = useToken('colors', 'warning600');
  const warning700 = useToken('colors', 'warning700');
  const primary600 = useToken('colors', 'primary600');
  const text400 = useToken('colors', 'textLight400');
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Extraer valores primitivos para evitar recreaciones innecesarias
  const orgId = organization?.id;
  const activeLocationId = organization?.publicMetadata?.active_location_id as string | undefined;

  // Memoizar la función para evitar recrearla en cada render
  const loadActiveLocation = useCallback(async () => {
    if (!orgId) {
      setIsLoadingLocation(false);
      return;
    }

    setIsLoadingLocation(true);

    try {
      if (activeLocationId) {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, is_main')
          .eq('id', activeLocationId)
          .eq('org_id', orgId)
          .single();

        if (!error && data) {
          setActiveLocation(data);
        }
      } else {
        // Si no hay sede activa, buscar la principal
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, is_main')
          .eq('org_id', orgId)
          .eq('is_main', true)
          .single();

        if (!error && data) {
          setActiveLocation(data);
        }
      }
    } catch (err: any) {
      console.error('Error loading active location:', err);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [orgId, activeLocationId, supabase]);

  useEffect(() => {
    if (orgLoaded && orgId) {
      loadActiveLocation();
    }
  }, [orgLoaded, orgId, loadActiveLocation]);

  if (!orgLoaded) {
    return (
      <Center flex={1}>
        <VStack gap="$4">
          <LoadingSkeletonCard lines={2} />
          <LoadingSkeletonCard lines={2} />
        </VStack>
      </Center>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <VStack gap="$2">
            <Heading size="2xl" color="$text900" fontWeight="$bold">
              Dashboard Profesional
            </Heading>
            <Text size="md" color="$text600">
              {organization?.name || 'Organización'}
            </Text>
          </VStack>

          {/* Información de Sede Activa */}
          {isLoadingLocation ? (
            <LoadingSkeletonCard lines={2} />
          ) : activeLocation ? (
            <InfoCard
              title="Sede Activa"
              value={activeLocation.name}
              subtitle={activeLocation.is_main ? 'Sede Principal' : 'Sede Secundaria'}
              icon="location"
              variant="primary"
              onPress={() => router.push('/(tabs)/settings')}
            />
          ) : (
            <Box
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$warning50"
              borderWidth="$1"
              borderColor="$warning200"
            >
              <HStack alignItems="center" gap="$3">
                <Ionicons name="alert-circle" size={iconMd} color={warning600} />
                <VStack flex={1} gap="$1">
                  <Text size="sm" fontWeight="$semibold" color={warning700}>
                    No hay sede activa
                  </Text>
                  <Text size="xs" color={warning600}>
                    Configura una sede para comenzar
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Estadísticas Rápidas */}
          <VStack gap="$4">
            <SectionHeader
              title="Estadísticas"
              subtitle="Resumen de tu actividad"
              variant="compact"
            />

            <VStack gap="$3">
              <InfoCard
                title="Pacientes del Día"
                value="0"
                subtitle="Sin citas programadas"
                icon="calendar"
                variant="default"
              />
              <InfoCard
                title="Pacientes Totales"
                value="0"
                subtitle="Registrados en el sistema"
                icon="people"
                variant="default"
              />
            </VStack>
          </VStack>

          {/* Accesos Rápidos */}
          <VStack gap="$4">
            <SectionHeader
              title="Gestión"
              subtitle="Administra tu negocio"
              variant="compact"
            />

            <VStack gap="$3">
              <Pressable
                onPress={() => router.push('/(tabs)/settings')}
                sx={{
                  ':active': {
                    opacity: 0.8,
                  },
                }}
              >
                <Box
                  padding="$4"
                  borderRadius="$lg"
                  backgroundColor="$white"
                  borderWidth="$1"
                  borderColor="$borderLight200"
                >
                  <HStack alignItems="center" gap="$4">
                    <Box
                      width="$10"
                      height="$10"
                      borderRadius="$lg"
                      backgroundColor="$primary100"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Ionicons name="location" size={iconMd} color={primary600} />
                    </Box>
                    <VStack flex={1} gap="$1">
                      <Text size="md" fontWeight="$semibold" color="$text900">
                        Gestión de Sedes
                      </Text>
                      <Text size="sm" color="$text600">
                        Administra las sedes de tu organización
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={iconMd} color={text400} />
                  </HStack>
                </Box>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/settings')}
                sx={{
                  ':active': {
                    opacity: 0.8,
                  },
                }}
              >
                <Box
                  padding="$4"
                  borderRadius="$lg"
                  backgroundColor="$white"
                  borderWidth="$1"
                  borderColor="$borderLight200"
                >
                  <HStack alignItems="center" gap="$4">
                    <Box
                      width="$10"
                      height="$10"
                      borderRadius="$lg"
                      backgroundColor="$primary100"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Ionicons name="people" size={iconMd} color={primary600} />
                    </Box>
                    <VStack flex={1} gap="$1">
                      <Text size="md" fontWeight="$semibold" color="$text900">
                        Asignaciones de Usuarios
                      </Text>
                      <Text size="sm" color="$text600">
                        Gestiona el acceso de tu equipo
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={iconMd} color={text400} />
                  </HStack>
                </Box>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(tabs)/help')}
                sx={{
                  ':active': {
                    opacity: 0.8,
                  },
                }}
              >
                <Box
                  padding="$4"
                  borderRadius="$lg"
                  backgroundColor="$white"
                  borderWidth="$1"
                  borderColor="$borderLight200"
                >
                  <HStack alignItems="center" gap="$4">
                    <Box
                      width="$10"
                      height="$10"
                      borderRadius="$lg"
                      backgroundColor="$primary100"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Ionicons name="help-circle" size={iconMd} color={primary600} />
                    </Box>
                    <VStack flex={1} gap="$1">
                      <Text size="md" fontWeight="$semibold" color="$text900">
                        Ayuda y Soporte
                      </Text>
                      <Text size="sm" color="$text600">
                        Guías y documentación profesional
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={iconMd} color={text400} />
                  </HStack>
                </Box>
              </Pressable>
            </VStack>
          </VStack>

          {/* Nota Informativa */}
          <Box
            padding="$4"
            borderRadius="$lg"
            backgroundColor="$primary50"
            borderWidth="$1"
            borderColor="$primary200"
          >
            <HStack alignItems="flex-start" gap="$3">
              <Ionicons name="information-circle" size={iconMd} color={primary600} />
              <VStack flex={1} gap="$1">
                <Text size="sm" fontWeight="$semibold" color="$primary700">
                  Modo Profesional Activo
                </Text>
                <Text size="xs" color="$primary600">
                  Estás trabajando en el contexto profesional. Todos los datos y acciones se
                  asociarán a tu organización activa.
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
