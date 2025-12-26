import React from 'react';
import { useOrganization } from '@clerk/clerk-expo';
import { FavoritesScreen } from '@/features/User_Space/screens/FavoritesScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { View, Text, StyleSheet } from 'react-native';

export default function FavScreen() {
  const { organization, isLoaded } = useOrganization();

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Favoritos solo disponibles en el Espacio Personal (B2C)
  if (organization) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acceso no autorizado</Text>
        <Text style={styles.subtitle}>
          Esta sección está disponible solo en tu perfil personal.
        </Text>
      </View>
    );
  }

  return <FavoritesScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
