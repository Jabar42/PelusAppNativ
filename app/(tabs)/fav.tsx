import React from 'react';
import { useAuthStore } from '@/core/store/authStore';
import { FavoritesScreen } from '@/features/B2C_Shop/screens/FavoritesScreen';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { View, Text, StyleSheet } from 'react-native';

export default function FavScreen() {
  const { userRole, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Only B2C users can access favorites
  if (userRole !== 'B2C') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Acceso no autorizado</Text>
        <Text style={styles.subtitle}>
          Esta sección está disponible solo para clientes.
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
