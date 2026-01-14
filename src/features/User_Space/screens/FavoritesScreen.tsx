import React from 'react';
import {
  Box,
  VStack,
  ScrollView,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '@/features/Shared/components/EmptyState';
import SectionHeader from '@/features/Shared/components/SectionHeader';

export function FavoritesScreen() {
  // Por ahora, siempre mostramos empty state
  // En el futuro, aquí se cargarían los favoritos desde Supabase
  const favorites: any[] = [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          <SectionHeader
            title="Mis Favoritos"
            subtitle="Servicios y productos guardados"
            variant="default"
          />

          {favorites.length === 0 ? (
            <EmptyState
              icon="heart-outline"
              title="No tienes favoritos aún"
              description="Explora servicios veterinarios, paseadores y otros profesionales. Guarda tus favoritos para acceder rápidamente más tarde."
              actionLabel="Explorar Servicios"
              onAction={() => {
                // Navegar a exploración de servicios (cuando esté implementada)
                // router.push('/explore');
              }}
            />
          ) : (
            <VStack gap="$3">
              {/* Aquí se renderizarían los favoritos cuando existan */}
              {/* Por ahora está vacío porque no hay datos */}
            </VStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
