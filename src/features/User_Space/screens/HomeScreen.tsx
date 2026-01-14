import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  SafeAreaView,
  Center,
  Spinner,
  Icon,
} from '@gluestack-ui/themed';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import WorkspaceManager from '../components/WorkspaceManager';
import EmptyState from '@/features/Shared/components/EmptyState';
import InfoCard from '@/features/Shared/components/InfoCard';
import SectionHeader from '@/features/Shared/components/SectionHeader';
import { LoadingSkeletonCard } from '@/features/Shared/components/LoadingSkeleton';
import InstallPWAButton from '@/features/Shared/components/InstallPWAButton';
import PetCard from '../components/PetCard';

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  birth_date?: string;
  photo_url?: string;
  weight?: number;
  gender?: string;
  color?: string;
  notes?: string;
}

export function HomeScreen() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
  }, [userId]);

  const loadPets = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPets(data || []);
    } catch (err: any) {
      console.error('Error loading pets:', err);
      setError(err.message || 'Error al cargar las mascotas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPet = () => {
    router.push('/add-edit-pet');
  };

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: '/pet-detail',
      params: { id: petId },
    });
  };

  const handleEditPet = (petId: string) => {
    router.push({
      pathname: '/add-edit-pet',
      params: { id: petId },
    });
  };

  const handleDeletePet = async (petId: string) => {
    Alert.alert(
      'Eliminar Mascota',
      '¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('pets')
                .delete()
                .eq('id', petId);

              if (error) throw error;
              loadPets(); // Recargar lista
            } catch (error: any) {
              console.error('Error deleting pet:', error);
              Alert.alert(
                'Error',
                'Error al eliminar la mascota: ' + (error.message || 'Error desconocido')
              );
            }
          },
        },
      ]
    );
  };

  return (
    <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <VStack gap="$2">
            <Heading size="2xl" color="$text900" fontWeight="$bold">
              Bienvenido
            </Heading>
            <Text size="md" color="$text600">
              Gestiona tus mascotas y encuentra servicios
            </Text>
          </VStack>

          {/* Workspace Manager */}
          <WorkspaceManager />

          {/* Estadísticas Rápidas */}
          <VStack gap="$4">
            <SectionHeader
              title="Resumen"
              subtitle="Tus mascotas registradas"
              variant="compact"
            />

            {isLoading ? (
              <VStack gap="$3">
                <LoadingSkeletonCard lines={2} />
                <LoadingSkeletonCard lines={2} />
              </VStack>
            ) : error ? (
              <Box
                padding="$4"
                borderRadius="$lg"
                backgroundColor="$error50"
                borderWidth="$1"
                borderColor="$error200"
              >
                <HStack alignItems="center" gap="$3">
                  <Icon as={Ionicons} name="alert-circle" size="$md" color="$error600" />
                  <Text size="sm" color="$error700" flex={1}>
                    {error}
                  </Text>
                </HStack>
              </Box>
            ) : pets.length === 0 ? (
              <EmptyState
                icon="paw-outline"
                title="No tienes mascotas registradas"
                description="Agrega tu primera mascota para comenzar a gestionar su información y encontrar servicios veterinarios."
                actionLabel="Agregar Mascota"
                onAction={handleAddPet}
              />
            ) : (
              <VStack gap="$3">
                <InfoCard
                  title="Total de Mascotas"
                  value={pets.length}
                  icon="paw"
                  variant="primary"
                />

                {pets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    id={pet.id}
                    name={pet.name}
                    species={pet.species}
                    breed={pet.breed}
                    birthDate={pet.birth_date}
                    photoUrl={pet.photo_url}
                    onPress={() => handlePetPress(pet.id)}
                    onEdit={() => handleEditPet(pet.id)}
                    onDelete={() => handleDeletePet(pet.id)}
                  />
                ))}

              </VStack>
            )}
          </VStack>

          {/* Accesos Rápidos */}
          <VStack gap="$4">
            <SectionHeader
              title="Accesos Rápidos"
              variant="compact"
            />

            <VStack gap="$3">
              <Box
                as="button"
                padding="$4"
                borderRadius="$lg"
                backgroundColor="$white"
                borderWidth="$1"
                borderColor="$borderLight200"
                onPress={() => router.push('/(tabs)/fav')}
                sx={{
                  ':active': {
                    backgroundColor: '$backgroundLight50',
                  },
                }}
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
                    <Icon as={Ionicons} name="heart" size="$md" color="$primary600" />
                  </Box>
                  <VStack flex={1} gap="$1">
                    <Text size="md" fontWeight="$semibold" color="$text900">
                      Favoritos
                    </Text>
                    <Text size="sm" color="$text600">
                      Tus servicios favoritos
                    </Text>
                  </VStack>
                  <Icon as={Ionicons} name="chevron-forward" size="$md" color="$text400" />
                </HStack>
              </Box>

              <Box
                as="button"
                padding="$4"
                borderRadius="$lg"
                backgroundColor="$white"
                borderWidth="$1"
                borderColor="$borderLight200"
                onPress={() => router.push('/(tabs)/help')}
                sx={{
                  ':active': {
                    backgroundColor: '$backgroundLight50',
                  },
                }}
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
                    <Icon as={Ionicons} name="help-circle" size="$md" color="$primary600" />
                  </Box>
                  <VStack flex={1} gap="$1">
                    <Text size="md" fontWeight="$semibold" color="$text900">
                      Ayuda
                    </Text>
                    <Text size="sm" color="$text600">
                      Preguntas frecuentes y soporte
                    </Text>
                  </VStack>
                  <Icon as={Ionicons} name="chevron-forward" size="$md" color="$text400" />
                </HStack>
              </Box>
            </VStack>
          </VStack>

          {/* Install PWA Button (solo web) */}
          <InstallPWAButton />
        </Box>
      </ScrollView>
    </RNSafeAreaView>
  );
}
