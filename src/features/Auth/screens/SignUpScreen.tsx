import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useSignUp, useAuth, useUser } from '@clerk/clerk-expo';
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
import { useAuthSync } from '../hooks/useAuthSync';

export function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Sincronizar estado de onboarding
  useAuthSync();

  // Si el usuario ya está autenticado, redirigir
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace('/(initial)/loading');
    }
  }, [authLoaded, isSignedIn, router]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
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
      const clerkError = err.errors?.[0]?.message || 'Error al registrarse';
      setError(clerkError);
    }
  };

  return (
    <Box flex={1} backgroundColor="$white" justifyContent="center" p="$6">
      <VStack space="xl" width="$full" maxWidth={400} alignSelf="center">
        <VStack space="xs">
          <Heading size="3xl" color="$text900">Crea tu cuenta</Heading>
          <Text size="md" color="$text500">Únete a la comunidad de PelusApp</Text>
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
          isDisabled={isLoading || !isLoaded}
          onPress={onSignUpPress}
          mt="$4"
          backgroundColor="$primary600"
        >
          {isLoading ? <ButtonSpinner mr="$2" /> : null}
          <ButtonText>Registrarse</ButtonText>
        </Button>

        <HStack justifyContent="center" alignItems="center" mt="$6" space="xs">
          <Text size="sm" color="$text500">¿Ya tienes una cuenta?</Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text size="sm" color="$primary600" fontWeight="$bold">Inicia Sesión</Text>
          </Pressable>
        </HStack>
      </VStack>
    </Box>
  );
}
