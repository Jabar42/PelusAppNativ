import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

interface OrgMembersResponse {
  members: OrgMember[];
}

export function LocationAssignmentsScreen() {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: true });
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

  // Obtener rol del usuario actual para validar permisos
  const currentMembership = useMemo(() => {
    return userMemberships?.data?.find(
      (m) => m.organization.id === organization?.id
    );
  }, [userMemberships?.data, organization?.id]);

  const canManageAssignments = useMemo(() => {
    return ['org:admin', 'org:creator'].includes(currentMembership?.role ?? '');
  }, [currentMembership?.role]);

  // Usar useRef para getToken para evitar recreaciones innecesarias
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  // Extraer valores primitivos para dependencias
  const orgId = organization?.id;

  // Cargar datos (memoizado con useCallback)
  const loadData = useCallback(async () => {
    if (!orgId) return;

    setIsLoading(true);
    setError('');

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) throw new Error('No se pudo obtener el token');

      // Cargar sedes
      const locationsResponse = await apiClient.get<LocationsResponse>(
        `/manage-location/list?orgId=${orgId}`,
        token
      );

      if (locationsResponse.error) {
        throw new Error(locationsResponse.error);
      }

      setLocations(locationsResponse.data?.locations || []);

      // Cargar miembros de la organización desde la nueva Netlify Function
      const membersResponse = await apiClient.get<OrgMembersResponse>(
        `/get-org-members?orgId=${orgId}`,
        token
      );

      if (membersResponse.error) {
        throw new Error(membersResponse.error);
      }

      setMembers(membersResponse.data?.members || []);

      // Cargar asignaciones desde Supabase
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_location_assignments')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true);

      if (assignmentsError) {
        throw assignmentsError;
      }

      setAssignments(assignmentsData || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, supabase]);

  useEffect(() => {
    if (orgLoaded && orgId) {
      loadData();
    }
  }, [orgLoaded, orgId, loadData]);

  // Asignar usuario a sede (memoizado)
  const handleAssign = useCallback(async () => {
    if (!orgId || !selectedUserId || !selectedLocationId || !selectedRole) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!canManageAssignments) {
      setError('No tienes permisos para asignar usuarios. Solo los administradores pueden hacer esto.');
      return;
    }

    setIsAssigning(true);
    setError('');

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
      if (!token) throw new Error('No se pudo obtener el token');

      const response = await apiClient.post(
        '/manage-location/assign',
        {
          orgId,
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
      console.error('Error assigning user:', err);
      setError(err.message || 'Error al asignar usuario');
    } finally {
      setIsAssigning(false);
    }
  }, [orgId, selectedUserId, selectedLocationId, selectedRole, canManageAssignments, loadData]);

  // Remover asignación (memoizado)
  const handleRemoveAssignment = useCallback(async (assignmentId: string) => {
    if (!canManageAssignments) {
      setError('No tienes permisos para remover asignaciones. Solo los administradores pueden hacer esto.');
      return;
    }

    if (!confirm('¿Estás seguro de remover esta asignación?')) {
      return;
    }

    setError('');

    try {
      const token = await getTokenRef.current({ template: 'supabase' });
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
      console.error('Error removing assignment:', err);
      setError(err.message || 'Error al remover la asignación');
    }
  }, [canManageAssignments, loadData]);

  // Obtener asignaciones de un usuario (memoizado)
  const getUserAssignments = useCallback((userId: string) => {
    return assignments.filter(a => a.user_id === userId);
  }, [assignments]);

  // Obtener nombre del usuario (memoizado)
  const getUserName = useCallback((userId: string) => {
    const member = members.find(m => m.userId === userId);
    if (member?.firstName || member?.lastName) {
      return `${member.firstName || ''} ${member.lastName || ''}`.trim();
    }
    return member?.emailAddress || userId.substring(0, 8) + '...';
  }, [members]);

  // Obtener nombre de la sede (memoizado)
  const getLocationName = useCallback((locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'Sede desconocida';
  }, [locations]);

  // Obtener lista de usuarios únicos con asignaciones (memoizado)
  const uniqueUserIds = useMemo(() => {
    return Array.from(new Set(assignments.map(a => a.user_id)));
  }, [assignments]);

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

          {/* Formulario de asignación - Solo visible para admins */}
          {canManageAssignments ? (
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
          ) : (
            <Alert action="info" variant="outline">
              <HStack alignItems="center" gap="$3">
                <Ionicons name="information-circle" size={alertIconSize} color={text400} />
                <AlertText>
                  Solo los administradores pueden asignar usuarios a sedes.
                </AlertText>
              </HStack>
            </Alert>
          )}

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
              {uniqueUserIds.map((userId) => {
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
                            {canManageAssignments && (
                              <Pressable
                                onPress={() => handleRemoveAssignment(assignment.id)}
                              >
                                <Ionicons name="close-circle" size={20} color={error600} />
                              </Pressable>
                            )}
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
