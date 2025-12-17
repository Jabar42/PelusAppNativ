import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';

export default function B2BOnboardingScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { setHasCompletedOnboarding } = useAuthStore();

  const handleContinue = async () => {
    // 1. Actualizar estado local para permitir navegación a tabs
    setHasCompletedOnboarding(true);

    // 2. Intentar persistir en metadata (opcional, buena práctica)
    if (user) {
      try {
        await user.update({
          publicMetadata: {
            ...user.publicMetadata,
            hasCompletedOnboarding: true,
          },
        });
      } catch (error) {
        console.error('Error updating metadata:', error);
        // Continuamos de todos modos porque el estado local ya se actualizó
      }
    }

    // 3. Navegar a tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PelusApp para Veterinarios</Text>
      <Text style={styles.subtitle}>
        Organiza tus pacientes, citas y recordatorios en un solo lugar.
      </Text>

      {isSignedIn ? (
        <TouchableOpacity
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Crear cuenta o iniciar sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});


