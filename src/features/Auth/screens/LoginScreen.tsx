import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Usar el hook useAuth para obtener el rol después del login
  useAuth();

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        nativeID="email-input"
        accessibilityLabel="Email"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        nativeID="password-input"
        accessibilityLabel="Contraseña"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd',
    padding: 12, 
    marginBottom: 16, 
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
    }),
  },
  error: { 
    color: '#dc2626', 
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

