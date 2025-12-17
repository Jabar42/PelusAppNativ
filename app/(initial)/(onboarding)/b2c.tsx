import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';

export default function B2COnboardingScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { hasCompletedOnboarding, setHasCompletedOnboarding } = useAuthStore();

  // Redirigir automáticamente si el usuario ya completó el onboarding
  useEffect(() => {
    if (isSignedIn && hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, hasCompletedOnboarding, router]);

  const handleContinue = async () => {
    // 1. Actualizar estado local - el useEffect manejará la navegación
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
    // La navegación se maneja automáticamente por el useEffect cuando hasCompletedOnboarding cambia
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PelusApp para Dueños de Mascotas</Text>
      <Text style={styles.subtitle}>
        Controla vacunas, citas y bienestar de tus peludos desde un solo lugar.
      </Text>

      {isSignedIn ? (
        // Usuario autenticado pero no ha completado onboarding
        !hasCompletedOnboarding && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        )
      ) : (
        // Usuario no autenticado - mostrar dos botones
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Registrarse</Text>
          </TouchableOpacity>
        </View>
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
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4f46e5',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: '#4f46e5',
  },
});


