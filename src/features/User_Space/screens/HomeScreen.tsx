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
  Pressable,
  useToken,
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
  const iconMd = useToken('space', '6');
  const errorIconColor = useToken('colors', 'error600');
  const primaryIconColor = useToken('colors', 'primary600');
  const textIconColor = useToken('colors', 'textLight400');
  const [pets, setPets] = useState<Pet[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
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

      const petsData = data || [];
      setPets(petsData);

      const signedUrls: Record<string, string> = {};
      await Promise.all(
        petsData.map(async (pet) => {
          if (!pet.photo_url) return;
          if (pet.photo_url.startsWith('http')) {
            signedUrls[pet.id] = pet.photo_url;
            return;
          }
          const { data: urlData } = await supabase.storage
            .from('pet-photos')
            .createSignedUrl(pet.photo_url, 60 * 60);
          if (urlData?.signedUrl) {
            signedUrls[pet.id] = urlData.signedUrl;
          }
        })
      );
      setPhotoUrls(signedUrls);
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
                  <Ionicons name="alert-circle" size={iconMd} color={errorIconColor} />
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
                    photoUrl={photoUrls[pet.id]}
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
              <Pressable
                onPress={() => router.push('/(tabs)/fav')}
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
                      <Ionicons name="heart" size={iconMd} color={primaryIconColor} />
                    </Box>
                    <VStack flex={1} gap="$1">
                      <Text size="md" fontWeight="$semibold" color="$text900">
                        Favoritos
                      </Text>
                      <Text size="sm" color="$text600">
                        Tus servicios favoritos
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={iconMd} color={textIconColor} />
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
                      <Ionicons name="help-circle" size={iconMd} color={primaryIconColor} />
                    </Box>
                    <VStack flex={1} gap="$1">
                      <Text size="md" fontWeight="$semibold" color="$text900">
                        Ayuda
                      </Text>
                      <Text size="sm" color="$text600">
                        Preguntas frecuentes y soporte
                      </Text>
                    </VStack>
                    <Ionicons name="chevron-forward" size={iconMd} color={textIconColor} />
                  </HStack>
                </Box>
              </Pressable>
            </VStack>
          </VStack>

          {/* Install PWA Button (solo web) */}
          <InstallPWAButton />
        </Box>
      </ScrollView>
    </RNSafeAreaView>
  );
}
