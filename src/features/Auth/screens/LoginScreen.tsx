import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAuthSync } from '../hooks/useAuthSync';

export function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sincronizar rol y estado de onboarding con el store
  useAuthSync();

  const onSignInPress = async () => {
    if (!isLoaded) {
      setError('Clerk aún no está listo. Por favor espera...');
      return;
    }

    // Validar campos
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña');
      return;
    }

    // Limpiar error anterior y mostrar loading
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Importante: redirigir al flujo de carga inicial
        // para que se sincronicen rol y onboarding antes de entrar a tabs
        router.replace('/(initial)/loading');
      } else {
        // Si el status no es 'complete', podría necesitar verificación adicional
        setError('Por favor completa el proceso de verificación');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setIsLoading(false);
      
      // Manejar diferentes tipos de errores
      if (err.errors && err.errors.length > 0) {
        const errorMessage = err.errors[0].message || err.errors[0].longMessage;
        setError(errorMessage || 'Error al iniciar sesión');
      } else if (err.message) {
        // Manejar errores de red específicamente
        if (err.message.includes('network') || err.message.includes('ERR_NETWORK')) {
          setError('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo');
        } else {
          setError(err.message);
        }
      } else if (err.status === 422) {
        setError('Credenciales inválidas. Por favor verifica tu email y contraseña');
      } else if (err.status === 400) {
        setError('Solicitud inválida. Por favor verifica tus datos');
      } else {
        setError('Error al iniciar sesión. Por favor intenta de nuevo');
      }
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
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={onSignInPress}
        disabled={isLoading || !isLoaded}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
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
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});


