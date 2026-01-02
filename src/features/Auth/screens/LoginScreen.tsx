import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useSignIn, useAuth, useUser, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading, 
  Input, 
  InputField, 
  Button, 
  ButtonText, 
  ButtonSpinner,
  Pressable,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  AlertCircleIcon
} from '@gluestack-ui/themed';
import { BRAND_NAME } from '@/core/config/brand';

export function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const router = useRouter();

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace('/(initial)/loading');
    }
  }, [authLoaded, isSignedIn, router]);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(initial)/loading');
      } else {
        setError('Por favor completa el proceso de verificación');
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      const clerkError = err.errors?.[0]?.message || 'Error al iniciar sesión';
      setError(clerkError);
    }
  };

  const onGoogleSignInPress = async () => {
    if (!isLoaded) return;

    setError('');
    setIsOAuthLoading(true);

    try {
      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow();

      if (createdSessionId) {
        await setActiveSession({ session: createdSessionId });
        router.replace('/(initial)/loading');
      } else {
        setIsOAuthLoading(false);
      }
    } catch (err: any) {
      setIsOAuthLoading(false);
      const clerkError = err.errors?.[0]?.message || 'Error al iniciar sesión con Google';
      setError(clerkError);
    }
  };

  return (
    <Box flex={1} backgroundColor="$white" justifyContent="center" p="$6">
      <VStack space="xl" width="$full" maxWidth={400} alignSelf="center">
        <VStack space="xs">
          <Heading size="3xl" color="$text900">Bienvenido</Heading>
          <Text size="md" color="$text500">Inicia sesión para continuar en {BRAND_NAME}</Text>
        </VStack>

        <VStack space="md" mt="$4">
          <FormControl isInvalid={!!error}>
            <FormControlLabel mb="$1">
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input variant="outline" size="md">
              <InputField 
                placeholder="tu@email.com" 
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
          </FormControl>

          <FormControl isInvalid={!!error}>
            <FormControlLabel mb="$1">
              <FormControlLabelText>Contraseña</FormControlLabelText>
            </FormControlLabel>
            <Input variant="outline" size="md">
              <InputField 
                placeholder="********" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </Input>
            {error ? (
              <FormControlError mt="$2">
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            ) : null}
          </FormControl>
        </VStack>

        <Button 
          size="lg" 
          variant="solid" 
          action="primary" 
          isDisabled={isLoading || isOAuthLoading || !isLoaded}
          onPress={onSignInPress}
          mt="$4"
          backgroundColor="$primary600"
        >
          {isLoading ? <ButtonSpinner mr="$2" /> : null}
          <ButtonText>Iniciar Sesión</ButtonText>
        </Button>

        <HStack justifyContent="center" alignItems="center" mt="$4" space="md">
          <Box flex={1} height="$0.5" backgroundColor="$border300" />
          <Text size="sm" color="$text400" px="$2">o</Text>
          <Box flex={1} height="$0.5" backgroundColor="$border300" />
        </HStack>

        <Button 
          size="lg" 
          variant="outline" 
          isDisabled={isLoading || isOAuthLoading || !isLoaded}
          onPress={onGoogleSignInPress}
          mt="$4"
          borderColor="$border400"
        >
          {isOAuthLoading ? <ButtonSpinner mr="$2" /> : null}
          <ButtonText color="$text900">Continuar con Google</ButtonText>
        </Button>

        <HStack justifyContent="center" alignItems="center" mt="$6" space="xs">
          <Text size="sm" color="$text500">¿No tienes una cuenta?</Text>
          <Pressable onPress={() => router.push('/(auth)/signup')}>
            <Text size="sm" color="$primary600" fontWeight="$bold">Regístrate</Text>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );
}
