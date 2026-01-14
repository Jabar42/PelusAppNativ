import React, { useState, useEffect } from 'react';
import { useOrganization, useAuth, useOrganizationList } from '@clerk/clerk-expo';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  ButtonText,
  ButtonSpinner,
  HStack,
  Pressable,
  Alert,
  AlertText,
  ScrollView,
  Card,
  Spinner,
  Center,
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  useToken,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '@/core/services/api';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';

interface Location {
  id: string;
  name: string;
  is_main: boolean;
}

interface Assignment {
  id: string;
  user_id: string;
  location_id: string;
  role: string;
  is_active: boolean;
}

interface OrgMember {
  userId: string;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  role: string;
}

interface LocationsResponse {
  locations: Location[];
}

export function LocationAssignmentsScreen() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships } = useOrganizationList();
  const { getToken } = useAuth();
  const supabase = useSupabaseClient();
  const text400 = useToken('colors', 'textLight400');
  const error600 = useToken('colors', 'error600');
  const alertIconSize = useToken('space', '6');
  const selectIconSize = useToken('space', '5');

  const [locations, setLocations] = useState<Location[]>([]);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedRole, setSelectedRole] = useState('staff');

  // Cargar datos
  const loadData = async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      // Cargar sedes
      const locationsResponse = await apiClient.get<LocationsResponse>(
        `/manage-location/list?orgId=${organization.id}`,
        token
      );

      if (locationsResponse.error) {
        throw new Error(locationsResponse.error);
      }

      setLocations(locationsResponse.data?.locations || []);

      // Cargar miembros de la organización desde Clerk
      // Nota: Esto requiere acceso a la lista de miembros, que puede requerir permisos especiales
      // Por ahora, usamos los miembros visibles desde userMemberships
      const memberships = userMemberships?.data ?? [];
      if (memberships.length) {
        const orgMembership = memberships.find((m) => m.organization.id === organization.id);
        if (orgMembership) {
          // Esto es una aproximación - en producción necesitarías obtener la lista completa de miembros
          // desde Clerk Admin API o desde Supabase si los guardas allí
          setMembers([
            {
              userId: orgMembership.publicUserData?.userId || '',
              firstName: orgMembership.publicUserData?.firstName || undefined,
              lastName: orgMembership.publicUserData?.lastName || undefined,
              emailAddress: orgMembership.publicUserData?.identifier || undefined,
              role: orgMembership.role || 'member',
            },
          ]);
        }
      }

      // Cargar asignaciones desde Supabase
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_location_assignments')
        .select('*')
        .eq('org_id', organization.id)
        .eq('is_active', true);

      if (assignmentsError) {
        throw assignmentsError;
      }

      setAssignments(assignmentsData || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgLoaded && organization?.id) {
      loadData();
    }
  }, [orgLoaded, organization?.id]);

  // Asignar usuario a sede
  const handleAssign = async () => {
    if (!organization?.id || !selectedUserId || !selectedLocationId || !selectedRole) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsAssigning(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.post(
        '/manage-location/assign',
        {
          orgId: organization.id,
          locationId: selectedLocationId,
          targetUserId: selectedUserId,
          role: selectedRole,
        },
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Limpiar formulario y recargar
      setSelectedUserId('');
      setSelectedLocationId('');
      setSelectedRole('staff');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al asignar usuario');
    } finally {
      setIsAssigning(false);
    }
  };

  // Remover asignación
  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de remover esta asignación?')) {
      return;
    }

    setError('');

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.delete(
        `/manage-location/assign?assignmentId=${assignmentId}`,
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      await loadData();
    } catch (err: any) {
      setError(err.message || 'Error al remover la asignación');
    }
  };

  // Obtener asignaciones de un usuario
  const getUserAssignments = (userId: string) => {
    return assignments.filter(a => a.user_id === userId);
  };

  // Obtener nombre del usuario
  const getUserName = (userId: string) => {
    const member = members.find(m => m.userId === userId);
    if (member?.firstName || member?.lastName) {
      return `${member.firstName || ''} ${member.lastName || ''}`.trim();
    }
    return member?.emailAddress || userId.substring(0, 8) + '...';
  };

  // Obtener nombre de la sede
  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Sede desconocida';
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
          <Heading size="xl" color="$text900">
            Asignación de Usuarios a Sedes
          </Heading>

          {error ? (
            <Alert action="error" variant="outline">
              <HStack alignItems="center" gap="$3">
                <Ionicons name="alert-circle" size={alertIconSize} color={error600} />
                <AlertText>{error}</AlertText>
              </HStack>
            </Alert>
          ) : null}

          {/* Formulario de asignación */}
          <Card>
            <Box padding="$4" borderBottomWidth="$1" borderColor="$borderLight200">
              <Heading size="md">Asignar Usuario a Sede</Heading>
            </Box>
            <Box padding="$4">
              <VStack space="md">
                <Select
                  selectedValue={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Seleccionar usuario" />
                    <Box marginRight="$3">
                      <Ionicons name="chevron-down" size={selectIconSize} color={text400} />
                    </Box>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {members.map((member) => (
                        <SelectItem
                          key={member.userId}
                          label={getUserName(member.userId)}
                          value={member.userId}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>

                <Select
                  selectedValue={selectedLocationId}
                  onValueChange={setSelectedLocationId}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Seleccionar sede" />
                    <Box marginRight="$3">
                      <Ionicons name="chevron-down" size={selectIconSize} color={text400} />
                    </Box>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          label={location.name}
                          value={location.id}
                        />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>

                <Select
                  selectedValue={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Seleccionar rol" />
                    <Box marginRight="$3">
                      <Ionicons name="chevron-down" size={selectIconSize} color={text400} />
                    </Box>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Admin" value="admin" />
                      <SelectItem label="Manager" value="manager" />
                      <SelectItem label="Staff" value="staff" />
                      <SelectItem label="Viewer" value="viewer" />
                    </SelectContent>
                  </SelectPortal>
                </Select>

                <Button
                  variant="solid"
                  action="primary"
                  onPress={handleAssign}
                  isDisabled={isAssigning || !selectedUserId || !selectedLocationId}
                >
                  {isAssigning ? <ButtonSpinner mr="$2" /> : null}
                  <ButtonText>Asignar</ButtonText>
                </Button>
              </VStack>
            </Box>
          </Card>

          {/* Lista de asignaciones */}
          {isLoading ? (
            <Center p="$8">
              <Spinner size="large" />
            </Center>
          ) : assignments.length === 0 ? (
            <Center p="$8">
              <VStack space="md" alignItems="center">
                <Ionicons name="people-outline" size={48} color={text400} />
                <Text color="$text600" textAlign="center">
                  No hay asignaciones. Asigna usuarios a sedes para comenzar.
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack space="md">
              <Heading size="md">Asignaciones Actuales</Heading>
              {Array.from(new Set(assignments.map(a => a.user_id))).map((userId) => {
                const userAssignments = getUserAssignments(userId);
                return (
                  <Card key={userId}>
                    <Box padding="$4" borderBottomWidth="$1" borderColor="$borderLight200">
                      <HStack justifyContent="space-between" alignItems="center">
                        <Heading size="sm">{getUserName(userId)}</Heading>
                      </HStack>
                    </Box>
                    <Box padding="$4">
                      <VStack space="sm">
                        {userAssignments.map((assignment) => (
                          <HStack
                            key={assignment.id}
                            justifyContent="space-between"
                            alignItems="center"
                            p="$2"
                            backgroundColor="$gray50"
                            borderRadius="$sm"
                          >
                            <VStack flex={1}>
                              <Text fontWeight="$bold" fontSize="$sm">
                                {getLocationName(assignment.location_id)}
                              </Text>
                              <Text fontSize="$xs" color="$text600">
                                Rol: {assignment.role}
                              </Text>
                            </VStack>
                            <Pressable
                              onPress={() => handleRemoveAssignment(assignment.id)}
                            >
                              <Ionicons name="close-circle" size={20} color={error600} />
                            </Pressable>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Card>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}
