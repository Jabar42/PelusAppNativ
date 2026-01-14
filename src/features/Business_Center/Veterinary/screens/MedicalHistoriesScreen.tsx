/**
 * Pantalla de lista de historiales médicos
 * Fase 2.2: Historiales Médicos (B2B - Veterinary)
 * Filtrados por sede activa, con búsqueda y filtros
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
  Input,
  InputField,
  Pressable,
  useToken,
} from '@gluestack-ui/themed';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import EmptyState from '@/features/Shared/components/EmptyState';
import SectionHeader from '@/features/Shared/components/SectionHeader';
import { LoadingSkeletonCard } from '@/features/Shared/components/LoadingSkeleton';

interface MedicalHistory {
  id: string;
  pet_id: string;
  location_id: string;
  veterinarian_id: string;
  visit_date: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  created_at: string;
  pets?: {
    name: string;
    species?: string;
  };
}

export function MedicalHistoriesScreen() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const iconMd = useToken('space', '6');
  const iconLg = useToken('space', '8');
  const text900 = useToken('colors', 'textLight900');
  const emerald600 = useToken('colors', 'emerald600');
  const error600 = useToken('colors', 'error600');
  const [histories, setHistories] = useState<MedicalHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistories();
  }, [userId]);

  const loadHistories = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('medical_histories')
        .select(`
          *,
          pets (
            name,
            species
          )
        `)
        .order('visit_date', { ascending: false })
        .limit(50); // Paginación básica

      // Si hay búsqueda, filtrar por nombre de mascota
      if (searchQuery.trim()) {
        query = query.ilike('pets.name', `%${searchQuery.trim()}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setHistories(data || []);
    } catch (err: any) {
      console.error('Error loading medical histories:', err);
      setError(err.message || 'Error al cargar los historiales');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce para búsqueda
    const timer = setTimeout(() => {
      loadHistories();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddHistory = () => {
    router.push('/add-edit-medical-history');
  };

  const handleHistoryPress = (historyId: string) => {
    // Navegar a detalles (cuando se implemente)
    // router.push({ pathname: '/medical-history-detail', params: { id: historyId } });
  };

  return (
    <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <HStack alignItems="center" gap="$4">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={iconLg} color={text900} />
            </Pressable>
            <Heading size="xl" color="$text900" flex={1}>
              Historiales Médicos
            </Heading>
            <Pressable onPress={handleAddHistory}>
              <Ionicons name="add-circle" size={iconLg} color={emerald600} />
            </Pressable>
          </HStack>

          {/* Búsqueda */}
          <Input size="md">
            <InputField
              placeholder="Buscar por nombre de mascota..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Input>

          {/* Lista */}
          {isLoading ? (
            <VStack gap="$3">
              <LoadingSkeletonCard lines={3} />
              <LoadingSkeletonCard lines={3} />
              <LoadingSkeletonCard lines={3} />
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
                <Ionicons name="alert-circle" size={iconMd} color={error600} />
                <Text size="sm" color="$error700" flex={1}>
                  {error}
                </Text>
              </HStack>
            </Box>
          ) : histories.length === 0 ? (
            <EmptyState
              icon="medical-outline"
              title="No hay historiales médicos"
              description={searchQuery ? 'No se encontraron historiales con ese nombre' : 'Comienza agregando el primer historial médico'}
              actionLabel="Agregar Historial"
              onAction={handleAddHistory}
            />
          ) : (
            <VStack gap="$3">
              {histories.map((history) => (
                <Pressable
                  key={history.id}
                  onPress={() => handleHistoryPress(history.id)}
                >
                  <Box
                    padding="$4"
                    borderRadius="$lg"
                    backgroundColor="$white"
                    borderWidth="$1"
                    borderColor="$borderLight200"
                  >
                    <VStack gap="$2">
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text size="md" fontWeight="$semibold" color="$text900">
                          {history.pets?.name || 'Mascota desconocida'}
                        </Text>
                        <Text size="xs" color="$text500">
                          {new Date(history.visit_date).toLocaleDateString('es-ES')}
                        </Text>
                      </HStack>
                      {history.diagnosis && (
                        <Text size="sm" color="$text600" numberOfLines={2}>
                          {history.diagnosis}
                        </Text>
                      )}
                      {history.treatment && (
                        <Text size="xs" color="$text500" numberOfLines={1}>
                          Tratamiento: {history.treatment}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Pressable>
              ))}
            </VStack>
          )}
        </Box>
      </ScrollView>
    </RNSafeAreaView>
  );
}
