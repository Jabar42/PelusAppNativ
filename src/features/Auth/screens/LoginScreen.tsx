import { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useSignIn, useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAuthSync } from '../hooks/useAuthSync';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const { pendingRole } = useOnboardingStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sincronizar rol y estado de onboarding con el store
  useAuthSync();

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace('/(initial)/loading');
    }
  }, [authLoaded, isSignedIn, router]);

  // Actualizar metadata cuando el usuario esté disponible después del login
  useEffect(() => {
    if (user && pendingRole && !user.publicMetadata?.role && isSignedIn) {
      user.update({
        unsafeMetadata: { pendingRole },
      }).then(() => {
        console.log('Updated unsafeMetadata.pendingRole:', pendingRole);
      }).catch((error) => {
        console.error('Failed to update metadata:', error);
        // No bloquear el flujo, el webhook puede procesarlo después
      });
    }
  }, [user, pendingRole, isSignedIn]);

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
        
        // Actualizar metadata inmediatamente después del registro exitoso
        // Esto minimiza la race condition con el webhook
        if (pendingRole && user && !user.publicMetadata?.role) {
          try {
            await user.update({
              unsafeMetadata: { pendingRole },
            });
            console.log('Updated unsafeMetadata.pendingRole:', pendingRole);
          } catch (metadataError) {
            console.error('Failed to update metadata:', metadataError);
            // No bloquear el flujo, el webhook puede procesarlo después
          }
        }
        
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
        const errorMessage = err.errors[0].message || err.errors[0].longMessage || '';
        const errorMessageLower = errorMessage.toLowerCase();
        
        // Verificar si es un error de red
        const isNetworkError = 
          errorMessageLower.includes('network') || 
          errorMessageLower.includes('err_network') ||
          errorMessageLower.includes('failed to fetch') ||
          errorMessageLower.includes('network error') ||
          errorMessageLower.includes('network_changed') ||
          errorMessageLower.includes('fetch failed');
        
        if (isNetworkError) {
          setError('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo');
          return;
        }
        
        // Manejar específicamente el error de sesión existente
        if (errorMessage.includes('Session already exists') || errorMessage.includes('session already exists')) {
          // Si ya hay una sesión, intentar activarla y redirigir
          try {
            // Verificar si hay una sesión activa y redirigir
            if (isSignedIn) {
              router.replace('/(initial)/loading');
              return;
            }
            // Si no hay sesión activa pero Clerk dice que existe, limpiar y reintentar
            setError('Ya existe una sesión activa. Redirigiendo...');
            setTimeout(() => {
              router.replace('/(initial)/loading');
            }, 1000);
            return;
          } catch (redirectErr) {
            setError('Ya estás autenticado. Redirigiendo...');
            setTimeout(() => {
              router.replace('/(initial)/loading');
            }, 1000);
            return;
          }
        }
        
        setError(errorMessage || 'Error al iniciar sesión');
      } else if (err.message) {
        // Manejar errores de red específicamente
        const errorMessageLower = err.message.toLowerCase();
        const isNetworkError = 
          errorMessageLower.includes('network') || 
          errorMessageLower.includes('err_network') ||
          errorMessageLower.includes('failed to fetch') ||
          errorMessageLower.includes('network error') ||
          errorMessageLower.includes('network_changed') ||
          errorMessageLower.includes('fetch failed');
        
        if (isNetworkError) {
          setError('Error de conexión. Por favor verifica tu conexión a internet e intenta de nuevo');
        } else if (err.message.includes('Session already exists') || err.message.includes('session already exists')) {
          // Manejar el error de sesión existente en el mensaje
          setError('Ya estás autenticado. Redirigiendo...');
          setTimeout(() => {
            router.replace('/(initial)/loading');
          }, 1000);
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


