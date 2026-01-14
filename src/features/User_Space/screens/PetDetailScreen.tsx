/**
 * Pantalla de detalles de una mascota
 * Fase 1.5: CRUD de Mascotas (B2C)
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  SafeAreaView,
  Button,
  ButtonText,
  Icon,
  Pressable,
  Image,
  Divider,
} from '@gluestack-ui/themed';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform } from 'react-native';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import { useThemeContext } from '@/core/hooks/useThemeContext';

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  birth_date?: string;
  weight?: number;
  gender?: string;
  color?: string;
  notes?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Calcula la edad aproximada en años y meses
 */
function calculateAge(birthDate?: string): string {
  if (!birthDate) return 'No especificada';
  
  const birth = new Date(birthDate);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  return `${years} ${years === 1 ? 'año' : 'años'} ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

function formatGender(gender?: string): string {
  switch (gender) {
    case 'male':
      return 'Macho';
    case 'female':
      return 'Hembra';
    case 'unknown':
      return 'Desconocido';
    default:
      return 'No especificado';
  }
}

function formatSpecies(species?: string): string {
  switch (species) {
    case 'dog':
      return 'Perro';
    case 'cat':
      return 'Gato';
    case 'rabbit':
      return 'Conejo';
    case 'bird':
      return 'Ave';
    case 'other':
      return 'Otro';
    default:
      return species || 'No especificada';
  }
}

export function PetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const { colors } = useThemeContext();

  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadPet(params.id);
    }
  }, [params.id]);

  const loadPet = async (petId: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error: any) {
      console.error('Error loading pet:', error);
      alert('Error al cargar la mascota: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (pet) {
      router.push({
        pathname: '/add-edit-pet',
        params: { id: pet.id },
      });
    }
  };

  const handleDelete = async () => {
    if (!pet || !userId) return;

    // Confirmación
    Alert.alert(
      'Eliminar Mascota',
      '¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await performDelete();
          },
        },
      ]
    );
  };

  const performDelete = async () => {
    if (!pet || !userId) return;

    setIsDeleting(true);
    try {
      // Eliminar foto del storage si existe
      if (pet.photo_url) {
        // Extraer el path del URL
        const urlParts = pet.photo_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `${userId}/${pet.id}/${fileName}`;
        
        await supabase.storage
          .from('pet-photos')
          .remove([filePath]);
      }

      // Eliminar mascota
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', pet.id);

      if (error) throw error;

      router.back();
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Error al eliminar la mascota: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text>Cargando...</Text>
        </Box>
      </RNSafeAreaView>
    );
  }

  if (!pet) {
    return (
      <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Box flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Text>Mascota no encontrada</Text>
          <Button marginTop="$4" onPress={() => router.back()}>
            <ButtonText>Volver</ButtonText>
          </Button>
        </Box>
      </RNSafeAreaView>
    );
  }

  return (
    <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <HStack alignItems="center" gap="$4">
            <Pressable onPress={() => router.back()}>
              <Icon as={Ionicons} name="arrow-back" size="$xl" color="$text900" />
            </Pressable>
            <Heading size="xl" color="$text900" flex={1}>
              {pet.name}
            </Heading>
          </HStack>

          {/* Foto */}
          <Box alignItems="center">
            <Box
              width={200}
              height={200}
              borderRadius="$full"
              backgroundColor={colors.primaryLight}
              justifyContent="center"
              alignItems="center"
              borderWidth="$2"
              borderColor={colors.primary}
              overflow="hidden"
            >
              {pet.photo_url ? (
                <Image
                  source={{ uri: pet.photo_url }}
                  alt={pet.name}
                  width="100%"
                  height="100%"
                  resizeMode="cover"
                />
              ) : (
                <Icon
                  as={Ionicons}
                  name="paw"
                  size="$4xl"
                  color={colors.primary}
                />
              )}
            </Box>
          </Box>

          {/* Información */}
          <VStack gap="$4">
            <Box
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$white"
              borderWidth="$1"
              borderColor="$gray200"
            >
              <VStack gap="$3">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text size="sm" color="$text500">
                    Especie
                  </Text>
                  <Text size="sm" fontWeight="$semibold" color="$text900">
                    {formatSpecies(pet.species)}
                  </Text>
                </HStack>

                {pet.breed && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size="sm" color="$text500">
                        Raza
                      </Text>
                      <Text size="sm" fontWeight="$semibold" color="$text900">
                        {pet.breed}
                      </Text>
                    </HStack>
                  </>
                )}

                {pet.birth_date && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size="sm" color="$text500">
                        Edad
                      </Text>
                      <Text size="sm" fontWeight="$semibold" color="$text900">
                        {calculateAge(pet.birth_date)}
                      </Text>
                    </HStack>
                  </>
                )}

                {pet.weight && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size="sm" color="$text500">
                        Peso
                      </Text>
                      <Text size="sm" fontWeight="$semibold" color="$text900">
                        {pet.weight} kg
                      </Text>
                    </HStack>
                  </>
                )}

                {pet.gender && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size="sm" color="$text500">
                        Género
                      </Text>
                      <Text size="sm" fontWeight="$semibold" color="$text900">
                        {formatGender(pet.gender)}
                      </Text>
                    </HStack>
                  </>
                )}

                {pet.color && (
                  <>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text size="sm" color="$text500">
                        Color
                      </Text>
                      <Text size="sm" fontWeight="$semibold" color="$text900">
                        {pet.color}
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </Box>

            {pet.notes && (
              <Box
                padding="$4"
                borderRadius="$lg"
                backgroundColor="$white"
                borderWidth="$1"
                borderColor="$gray200"
              >
                <VStack gap="$2">
                  <Text size="sm" fontWeight="$semibold" color="$text900">
                    Notas
                  </Text>
                  <Text size="sm" color="$text600">
                    {pet.notes}
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Placeholder para historial médico (Fase 2) */}
            <Box
              padding="$4"
              borderRadius="$lg"
              backgroundColor="$gray50"
              borderWidth="$1"
              borderColor="$gray200"
            >
              <Text size="sm" color="$text500" fontStyle="italic">
                Historial médico disponible próximamente
              </Text>
            </Box>
          </VStack>

          {/* Botones de acción */}
          <VStack gap="$3" marginTop="$4">
            <Button
              size="lg"
              backgroundColor={colors.primary}
              onPress={handleEdit}
            >
              <ButtonText>Editar Mascota</ButtonText>
            </Button>

            <Button
              variant="outline"
              size="lg"
              borderColor="$error600"
              onPress={handleDelete}
              isDisabled={isDeleting}
            >
              <ButtonText color="$error600">
                {isDeleting ? 'Eliminando...' : 'Eliminar Mascota'}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </RNSafeAreaView>
  );
}
