import React, { useState, useEffect } from 'react';
import { useOrganization, useAuth } from '@clerk/clerk-expo';
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
  AlertText,
  ScrollView,
  Card,
  Spinner,
  Center,
  useToken,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/core/services/api';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';

interface Location {
  id: string;
  org_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationsResponse {
  locations: Location[];
}

export function LocationsManagementScreen() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { getToken } = useAuth();
  const supabase = useSupabaseClient();
  const text400 = useToken('colors', 'textLight400');
  const error600 = useToken('colors', 'error600');
  const alertIconSize = useToken('space', '6');

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Cargar sedes
  const loadLocations = async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.get<LocationsResponse>(
        `/manage-location/list?orgId=${organization.id}`,
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setLocations(response.data?.locations || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las sedes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgLoaded && organization?.id) {
      loadLocations();
    }
  }, [orgLoaded, organization?.id]);

  // Crear nueva sede
  const handleCreateLocation = async () => {
    if (!organization?.id || !name.trim()) {
      setError('El nombre de la sede es requerido');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.post(
        '/manage-location',
        {
          orgId: organization.id,
          name: name.trim(),
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          isMain: false, // No será principal si ya existe una
        },
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Limpiar formulario y recargar
      setName('');
      setAddress('');
      setCity('');
      setState('');
      setPhone('');
      setEmail('');
      setShowCreateForm(false);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Error al crear la sede');
    } finally {
      setIsCreating(false);
    }
  };

  // Eliminar sede
  const handleDeleteLocation = async (locationId: string) => {
    if (!organization?.id) return;

    // Confirmación simple (podría mejorarse con un modal)
    if (!confirm('¿Estás seguro de eliminar esta sede? Esta acción no se puede deshacer.')) {
      return;
    }

    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.delete(
        `/manage-location?locationId=${locationId}`,
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la sede');
    }
  };

  if (!orgLoaded) {
    return (
      <Center flex={1}>
        <Spinner size="large" />
      </Center>
    );
  }

  if (!organization) {
    return (
      <Center flex={1} p="$6">
        <Text>No se encontró una organización activa.</Text>
      </Center>
    );
  }

  return (
    <ScrollView flex={1} backgroundColor="$white">
      <Box p="$6">
        <VStack space="lg">
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="xl" color="$text900">
              Gestión de Sedes
            </Heading>
            {!showCreateForm && (
              <Button
                size="sm"
                variant="solid"
                action="primary"
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add" size={16} color="white" style={{ marginRight: 4 }} />
                <ButtonText>Nueva Sede</ButtonText>
              </Button>
            )}
          </HStack>

          {error ? (
            <Alert action="error" variant="outline">
              <HStack alignItems="center" gap="$3">
                <Ionicons name="alert-circle" size={alertIconSize} color={error600} />
                <AlertText>{error}</AlertText>
              </HStack>
            </Alert>
          ) : null}

          {showCreateForm && (
            <Card>
              <Box padding="$4" borderBottomWidth="$1" borderColor="$borderLight200">
                <Heading size="md">Crear Nueva Sede</Heading>
              </Box>
              <Box padding="$4">
                <VStack space="md">
                  <FormControl isRequired>
                    <FormControlLabel>
                      <FormControlLabelText>Nombre de la sede</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="outline">
                      <InputField
                        placeholder="Ej: Sede Norte"
                        value={name}
                        onChangeText={setName}
                      />
                    </Input>
                  </FormControl>

                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText>Dirección</FormControlLabelText>
                    </FormControlLabel>
                    <Input variant="outline">
                      <InputField
                        placeholder="Calle y número"
                        value={address}
                        onChangeText={setAddress}
                      />
                    </Input>
                  </FormControl>

                  <HStack space="md">
                    <FormControl flex={1}>
                      <FormControlLabel>
                        <FormControlLabelText>Ciudad</FormControlLabelText>
                      </FormControlLabel>
                      <Input variant="outline">
                        <InputField
                          placeholder="Ciudad"
                          value={city}
                          onChangeText={setCity}
                        />
                      </Input>
                    </FormControl>

                    <FormControl flex={1}>
                      <FormControlLabel>
                        <FormControlLabelText>Estado/Departamento</FormControlLabelText>
                      </FormControlLabel>
                      <Input variant="outline">
                        <InputField
                          placeholder="Estado"
                          value={state}
                          onChangeText={setState}
                        />
                      </Input>
                    </FormControl>
                  </HStack>

                  <HStack space="md">
                    <FormControl flex={1}>
                      <FormControlLabel>
                        <FormControlLabelText>Teléfono</FormControlLabelText>
                      </FormControlLabel>
                      <Input variant="outline">
                        <InputField
                          placeholder="Teléfono"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                        />
                      </Input>
                    </FormControl>

                    <FormControl flex={1}>
                      <FormControlLabel>
                        <FormControlLabelText>Email</FormControlLabelText>
                      </FormControlLabel>
                      <Input variant="outline">
                        <InputField
                          placeholder="Email"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                        />
                      </Input>
                    </FormControl>
                  </HStack>

                  <HStack space="md" mt="$2">
                    <Button
                      flex={1}
                      variant="outline"
                      action="secondary"
                      onPress={() => {
                        setShowCreateForm(false);
                        setError('');
                      }}
                    >
                      <ButtonText>Cancelar</ButtonText>
                    </Button>
                    <Button
                      flex={1}
                      variant="solid"
                      action="primary"
                      onPress={handleCreateLocation}
                      isDisabled={isCreating || !name.trim()}
                    >
                      {isCreating ? <ButtonSpinner mr="$2" /> : null}
                      <ButtonText>Crear Sede</ButtonText>
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </Card>
          )}

          {isLoading ? (
            <Center p="$8">
              <Spinner size="large" />
            </Center>
          ) : locations.length === 0 ? (
            <Center p="$8">
              <VStack space="md" alignItems="center">
                <Ionicons name="location-outline" size={48} color="#999" />
                <Text color="$text600" textAlign="center">
                  No hay sedes registradas. Crea la primera sede para comenzar.
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack space="md">
              {locations.map((location) => (
                <Card key={location.id}>
                  <Box padding="$4" borderBottomWidth="$1" borderColor="$borderLight200">
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack alignItems="center" space="sm">
                        <Ionicons
                          name="location"
                          size={20}
                          color={location.is_main ? text400 : text400}
                        />
                        <Heading size="md">{location.name}</Heading>
                        {location.is_main && (
                          <Box
                            backgroundColor="$primary100"
                            px="$2"
                            py="$1"
                            borderRadius="$sm"
                          >
                            <Text fontSize="$xs" color="$primary700" fontWeight="$bold">
                              Principal
                            </Text>
                          </Box>
                        )}
                      </HStack>
                      <Pressable onPress={() => handleDeleteLocation(location.id)}>
                        <Ionicons name="trash-outline" size={20} color={error600} />
                      </Pressable>
                    </HStack>
                  </Box>
                  <Box padding="$4">
                    <VStack space="xs">
                      {location.address && (
                        <HStack alignItems="center" space="xs">
                          <Ionicons name="map-outline" size={16} color={text400} />
                          <Text fontSize="$sm" color="$text600">
                            {location.address}
                            {location.city && `, ${location.city}`}
                            {location.state && `, ${location.state}`}
                          </Text>
                        </HStack>
                      )}
                      {location.phone && (
                        <HStack alignItems="center" space="xs">
                          <Ionicons name="call-outline" size={16} color={text400} />
                          <Text fontSize="$sm" color="$text600">
                            {location.phone}
                          </Text>
                        </HStack>
                      )}
                      {location.email && (
                        <HStack alignItems="center" space="xs">
                          <Ionicons name="mail-outline" size={16} color={text400} />
                          <Text fontSize="$sm" color="$text600">
                            {location.email}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </Box>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}
