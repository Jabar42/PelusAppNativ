import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useOrganizationList, useAuth } from '@clerk/clerk-expo';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Input, 
  InputField, 
  Button, 
  ButtonText, 
  ButtonSpinner,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Pressable,
  Alert,
  AlertIcon,
  AlertText,
  InfoIcon,
  Center
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/core/services/api';

type BusinessType = 'veterinary' | 'walking' | 'grooming';

export function RegisterBusinessScreen() {
  const router = useRouter();
  const { createOrganization, isLoaded, setActive } = useOrganizationList();
  const { getToken } = useAuth();
  
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('veterinary');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para manejar reintentos si falla el backend pero la org ya existe
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

  /**
   * Intenta actualizar los metadatos de la organización en el backend.
   * No permite avanzar hasta que el backend confirme.
   */
  const updateMetadataInBackend = async (orgId: string) => {
    const token = await getToken();
    if (!token) throw new Error('No se pudo obtener el token de sesión');

    const response = await apiClient.post('/update-org-metadata', {
      orgId,
      type: businessType,
    }, token);

    if (response.error) {
      throw new Error(response.error);
    }

    return true;
  };

  const handleCreateBusiness = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterBusinessScreen.tsx:64',message:'handleCreateBusiness entry',data:{isLoaded, businessName, createdOrgId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!isLoaded || !createOrganization) return;

    if (!businessName.trim() && !createdOrgId) {
      setError('Por favor ingresa el nombre de tu negocio');
      return;
    }

    setIsLoading(true);
    setError('');

    // Función auxiliar para reintentar la creación con backoff
    const attemptCreateOrg = async (retries = 2): Promise<any> => {
      try {
        return await createOrganization({ name: businessName.trim() });
      } catch (err: any) {
        // Si es un error de red (Failed to fetch) y quedan reintentos
        const errorMessage = err.message || '';
        const isNetworkError = errorMessage.includes('fetch') || 
                             errorMessage.includes('Network') || 
                             errorMessage.includes('TypeError');
        
        if (retries > 0 && isNetworkError) {
          console.warn(`Error de red detectado. Reintentando... (${retries} restantes)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2s para estabilizar
          return attemptCreateOrg(retries - 1);
        }
        throw err;
      }
    };

    try {
      let orgId = createdOrgId;

      // 1. Crear la organización si no se ha creado aún
      if (!orgId) {
        const organization = await attemptCreateOrg();
        orgId = organization.id;
        setCreatedOrgId(orgId);
      }

      // 2. Intentar actualizar metadatos en el backend (publicMetadata)
      // Bloqueo de navegación: No seguimos hasta que esto sea exitoso
      await updateMetadataInBackend(orgId);

      // 4. EXTRA: Asegurar que el usuario sea marcado como professional si es su primera org
      const token = await getToken();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterBusinessScreen.tsx:110',message:'Attempting to call /complete-onboarding',data:{token: token ? 'EXISTS' : 'MISSING'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      await apiClient.post('/complete-onboarding', {
        userId: (await userLoaded && user?.id), // Usamos el ID del usuario actual
        userType: 'professional'
      }, token);

      // 3. Establecer como activa y navegar
      if (setActive) {
        await setActive({ organization: orgId });
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9fc7e58b-91ea-405c-841e-a7cd0c1803e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterBusinessScreen.tsx:122',message:'Error caught in flow',data:{message: err.message, name: err.name, stack: err.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('Error in business registration flow:', err);
      
      const errorMessage = err.message || '';
      const isNetworkError = errorMessage.includes('fetch') || 
                             errorMessage.includes('Network') || 
                             errorMessage.includes('TypeError');

      setError(
        isNetworkError 
          ? 'Error de conexión con el servidor de autenticación. Por favor, asegúrate de no tener bloqueadores de anuncios activos e intenta de nuevo.' 
          : createdOrgId 
            ? 'La organización se creó pero no pudimos configurar el tipo de negocio. Por favor, reintenta.' 
            : (err.errors?.[0]?.message || errorMessage || 'Error al crear el negocio')
      );
      setIsLoading(false);
    }
  };

  const businessOptions: { type: BusinessType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { type: 'veterinary', label: 'Veterinaria', icon: 'medical' },
    { type: 'walking', label: 'Paseos', icon: 'paw' },
    { type: 'grooming', label: 'Estética/Peluquería', icon: 'cut' },
  ];

  return (
    <Box flex={1} backgroundColor="$white" justifyContent="center" p="$6">
      <VStack space="xl" width="$full" maxWidth={400} alignSelf="center">
        <VStack space="xs">
          <Heading size="2xl" color="$text900">
            {createdOrgId ? 'Casi listo' : 'Registra tu Negocio'}
          </Heading>
          <Text size="md" color="$text500">
            {createdOrgId 
              ? 'Estamos terminando de configurar tu espacio profesional.' 
              : 'Configura tu espacio de trabajo profesional'}
          </Text>
        </VStack>

        {error ? (
          <Alert action="error" variant="outline">
            <AlertIcon as={InfoIcon} mr="$3" />
            <AlertText>{error}</AlertText>
          </Alert>
        ) : null}

        {!createdOrgId ? (
          <VStack space="lg" mt="$4">
            <FormControl isInvalid={!!error}>
              <FormControlLabel mb="$1">
                <FormControlLabelText>Nombre del negocio</FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="lg">
                <InputField 
                  placeholder="Ej: Clínica Veterinaria Pelusas" 
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </Input>
            </FormControl>

            <VStack space="sm">
              <Text fontWeight="$bold" size="sm" color="$text900">Tipo de servicio</Text>
              <HStack space="md" flexWrap="wrap">
                {businessOptions.map((option) => (
                  <Pressable 
                    key={option.type} 
                    onPress={() => setBusinessType(option.type)}
                    flex={1}
                    minWidth={110}
                  >
                    {({ pressed }) => (
                      <Box
                        p="$3"
                        borderWidth="$2"
                        borderColor={businessType === option.type ? '$primary600' : '$borderLight200'}
                        borderRadius="$lg"
                        backgroundColor={businessType === option.type ? '$primary50' : '$white'}
                        alignItems="center"
                      >
                        <Ionicons 
                          name={option.icon} 
                          size={24} 
                          color={businessType === option.type ? '$primary600' : '$text400'} 
                        />
                        <Text 
                          size="xs" 
                          mt="$1" 
                          fontWeight={businessType === option.type ? '$bold' : '$medium'}
                          color={businessType === option.type ? '$primary700' : '$text500'}
                          textAlign="center"
                        >
                          {option.label}
                        </Text>
                      </Box>
                    )}
                  </Pressable>
                ))}
              </HStack>
            </VStack>
          </VStack>
        ) : (
          <Center p="$4">
            <VStack space="md" alignItems="center">
              <Ionicons name="alert-circle-outline" size={48} color="$warning600" />
              <Text textAlign="center" color="$text600">
                Tu negocio "{businessName}" ya fue creado en Clerk, pero falta la configuración de servicios.
              </Text>
            </VStack>
          </Center>
        )}

        <Button 
          size="lg" 
          variant="solid" 
          action="primary" 
          isDisabled={isLoading || !isLoaded}
          onPress={handleCreateBusiness}
          mt="$4"
          backgroundColor="$primary600"
        >
          {isLoading ? <ButtonSpinner mr="$2" /> : null}
          <ButtonText>
            {createdOrgId ? 'Reintentar Configuración' : 'Comenzar ahora'}
          </ButtonText>
        </Button>

        {!createdOrgId && (
          <Pressable onPress={() => router.replace('/(tabs)')} mt="$2">
            <Text size="sm" color="$text400" textAlign="center">
              Omitir por ahora (Configurar luego)
            </Text>
          </Pressable>
        )}
      </VStack>
    </Box>
  );
}
