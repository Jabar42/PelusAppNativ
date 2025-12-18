import { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAuthSync } from '../hooks/useAuthSync';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
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

  // Actualizar metadata cuando el usuario esté disponible después del registro
  useEffect(() => {
    if (user && pendingRole && !user.publicMetadata?.role && isSignedIn) {
      // Verificar si unsafeMetadata.pendingRole ya está establecido y coincide
      // Esto previene llamadas API repetidas innecesarias
      const currentPendingRole = user.unsafeMetadata?.pendingRole;
      if (currentPendingRole === pendingRole) {
        // Ya está actualizado, no hacer nada
        return;
      }

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

  const onSignUpPress = async () => {
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

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Limpiar error anterior y mostrar loading
    setError('');
    setIsLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      // Verificar si se requiere verificación de email
      if (result.status === 'missing_requirements') {
        // Intentar completar el registro
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setError('Por favor verifica tu email. Revisa tu bandeja de entrada.');
        setIsLoading(false);
        return;
      }

      // Si el registro está completo, activar la sesión
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // No actualizar metadata aquí porque:
        // 1. El objeto `user` de useUser() no se actualiza sincrónicamente después de setActive()
        // 2. Necesita un re-render para que el hook actualice el valor
        // 3. El useEffect (líneas 30-49) manejará la actualización cuando user esté disponible
        // 4. El webhook también está diseñado para manejar esto si el useEffect no se ejecuta a tiempo
        // Esto evita race conditions y uso de datos stale/null
        
        // Importante: redirigir al flujo de carga inicial
        // para que se sincronicen rol y onboarding antes de entrar a tabs
        router.replace('/(initial)/loading');
      } else {
        // Si el status no es 'complete', podría necesitar verificación adicional
        setError('Por favor completa el proceso de verificación');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
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
        
        // Manejar errores específicos de registro
        if (errorMessageLower.includes('already exists') || errorMessageLower.includes('already registered')) {
          setError('Este email ya está registrado. Por favor inicia sesión en su lugar');
        } else if (errorMessageLower.includes('password') && errorMessageLower.includes('weak')) {
          setError('La contraseña es muy débil. Por favor usa una contraseña más segura');
        } else if (errorMessageLower.includes('invalid') && errorMessageLower.includes('email')) {
          setError('Email inválido. Por favor verifica tu email');
        } else {
          setError(errorMessage || 'Error al registrarse');
        }
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
        } else {
          setError(err.message);
        }
      } else if (err.status === 422) {
        setError('Datos inválidos. Por favor verifica tu email y contraseña');
      } else if (err.status === 400) {
        setError('Solicitud inválida. Por favor verifica tus datos');
      } else {
        setError('Error al registrarse. Por favor intenta de nuevo');
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
        onPress={onSignUpPress}
        disabled={isLoading || !isLoaded}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
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

