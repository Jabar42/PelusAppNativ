import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setPendingRole } = useOnboardingStore();

  const handleSelect = (role: 'B2B' | 'B2C') => {
    setPendingRole(role);
    if (role === 'B2B') {
      router.push('/(initial)/(onboarding)/b2b');
    } else {
      router.push('/(initial)/(onboarding)/b2c');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo quieres usar PelusApp?</Text>

      <TouchableOpacity style={styles.card} onPress={() => handleSelect('B2B')}>
        <Text style={styles.cardTitle}>Soy veterinario</Text>
        <Text style={styles.cardSubtitle}>
          Gestiona tu clínica, pacientes y recordatorios.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handleSelect('B2C')}>
        <Text style={styles.cardTitle}>Soy dueño de mascotas</Text>
        <Text style={styles.cardSubtitle}>
          Controla vacunas, citas y bienestar de tus peludos.
        </Text>
      </TouchableOpacity>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4ff',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
});


