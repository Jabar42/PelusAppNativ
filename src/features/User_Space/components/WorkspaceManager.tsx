import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOrganization, useOrganizationList, useAuth } from '@clerk/clerk-expo';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { apiClient } from '@/core/services/api';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Heading,
  Pressable, 
  Icon, 
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  Button,
  ButtonText,
  Divider,
  Center,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de Esqueleto (Skeleton) para el WorkspaceManager.
 * Proporciona una carga visual más elegante que un spinner.
 */
function WorkspaceSkeleton() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Box width="$full" mt="$4">
      <VStack space="md">
        {/* Texto de cabecera esqueleto */}
        <Animated.View style={animatedStyle}>
          <Box h="$4" w="$40" bg="$backgroundLight200" borderRadius="$sm" ml="$1" />
        </Animated.View>

        {/* Caja principal esqueleto */}
        <Animated.View style={animatedStyle}>
          <Box
            p="$4"
            borderWidth="$1"
            borderColor="$borderLight100"
            borderRadius="$xl"
            backgroundColor="$white"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <HStack space="md" alignItems="center">
                <Box w="$10" h="$10" bg="$backgroundLight100" borderRadius="$lg" />
                <VStack space="xs">
                  <Box h="$4" w="$32" bg="$backgroundLight200" borderRadius="$sm" />
                  <Box h="$3" w="$48" bg="$backgroundLight100" borderRadius="$sm" />
                </VStack>
              </HStack>
              <Box h="$5" w="$5" bg="$backgroundLight100" borderRadius="$full" />
            </HStack>
          </Box>
        </Animated.View>
      </VStack>
    </Box>
  );
}

/**
 * Gestor de Espacios de Trabajo (Workspace Manager).
 * Permite cambiar de organización o crear una nueva desde el perfil.
 * Utiliza un Actionsheet para una experiencia móvil limpia.
 */
interface Location {
  location_id: string;
  location_name: string;
  role: string;
  is_main: boolean;
}

export default function WorkspaceManager() {
  const router = useRouter();
  const { organization: activeOrg, isLoaded: orgLoaded } = useOrganization();
  const { userMemberships, isLoaded: listLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const { getToken, userId } = useAuth();
  const supabase = useSupabaseClient();

  const isFullyLoaded = orgLoaded && listLoaded;

  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);

  const handleClose = () => setShowActionsheet(false);
  const handleCloseLocationSheet = () => setShowLocationSheet(false);

  // Cargar sedes del usuario en la organización activa
  const loadUserLocations = async () => {
    if (!activeOrg?.id || !userId) {
      setLocations([]);
      setActiveLocationId(null);
      return;
    }

    setIsLoadingLocations(true);
    try {
      const { data, error } = await supabase.rpc('get_user_locations_in_org', {
        p_user_id: userId,
        p_org_id: activeOrg.id,
      });

      if (error) throw error;

      setLocations(data || []);
      
      // Obtener active_location_id de los metadatos de la organización
      const currentActiveLocationId = activeOrg.publicMetadata?.active_location_id as string | undefined;
      setActiveLocationId(currentActiveLocationId || null);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  useEffect(() => {
    if (isFullyLoaded && activeOrg) {
      loadUserLocations();
    } else {
      setLocations([]);
      setActiveLocationId(null);
    }
  }, [isFullyLoaded, activeOrg?.id, userId]);

  const handleSwitchOrg = async (orgId: string | null) => {
    if (setActive) {
      await setActive({ organization: orgId });
      handleClose();
    }
  };

  // Cambiar sede activa
  const handleSwitchLocation = async (locationId: string) => {
    if (!activeOrg?.id) return;

    try {
      const token = await getToken();
      if (!token) throw new Error('No se pudo obtener el token');

      // Actualizar active_location_id en Clerk
      const response = await apiClient.put(
        '/update-org-metadata',
        {
          orgId: activeOrg.id,
          active_location_id: locationId,
        },
        token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // Forzar refresh del token para que el nuevo location_id esté disponible inmediatamente
      await getToken({ template: 'supabase', skipCache: true });

      setActiveLocationId(locationId);
      handleCloseLocationSheet();

      // Recargar la organización para obtener los metadatos actualizados
      // Nota: Clerk debería actualizar automáticamente, pero forzamos recarga
      if (setActive) {
        await setActive({ organization: activeOrg.id });
      }
    } catch (error) {
      console.error('Error switching location:', error);
    }
  };

  const handleAddNewBusiness = () => {
    handleClose();
    // Reutilizamos el flujo de registro de negocio
    router.push('/(initial)/register-business');
  };

  if (!isFullyLoaded) {
    return <WorkspaceSkeleton />;
  }

  const memberships = userMemberships.data || [];
  const hasOrganizations = memberships.length > 0;

  return (
    <Box width="$full" mt="$4">
      <VStack space="md">
        <Text size="sm" fontWeight="$bold" color="$text500" px="$1">
          MI ACTIVIDAD PROFESIONAL
        </Text>

        <Pressable onPress={() => setShowActionsheet(true)}>
          {({ pressed }) => (
            <Box
              p="$4"
              borderWidth="$1"
              borderColor="$borderLight200"
              borderRadius="$xl"
              backgroundColor={pressed ? '$backgroundLight50' : '$white'}
            >
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space="md" alignItems="center" flex={1}>
                  <Center 
                    w="$10" 
                    h="$10" 
                    bg={activeOrg ? "$primary100" : "$backgroundLight100"} 
                    borderRadius="$lg"
                  >
                    <Ionicons 
                      name={activeOrg ? "briefcase" : "person"} 
                      size={20} 
                      color={activeOrg ? "$primary600" : "$text400"} 
                    />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="$bold" size="md" color="$text900">
                      {activeOrg ? activeOrg.name : "Espacio Personal"}
                    </Text>
                    <Text size="xs" color="$text500">
                      {activeOrg 
                        ? (locations.length > 1 
                            ? `${locations.length} sedes disponibles`
                            : locations.length === 1
                            ? locations[0].location_name
                            : "Modo Profesional Activo")
                        : "Gestionando mis mascotas"}
                    </Text>
                  </VStack>
                </HStack>
                <Ionicons name="chevron-down" size={20} color="$text400" />
              </HStack>
            </Box>
          )}
        </Pressable>

        {/* Selector de sede si hay múltiples sedes */}
        {activeOrg && locations.length > 1 && (
          <Pressable onPress={() => setShowLocationSheet(true)} mt="$2">
            {({ pressed }) => (
              <Box
                p="$3"
                borderWidth="$1"
                borderColor="$borderLight200"
                borderRadius="$lg"
                backgroundColor={pressed ? '$backgroundLight50' : '$white'}
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <HStack space="sm" alignItems="center" flex={1}>
                    <Ionicons name="location" size={16} color="$primary600" />
                    <Text size="sm" color="$text700" fontWeight="$medium">
                      {locations.find(l => l.location_id === activeLocationId)?.location_name || 
                       locations.find(l => l.is_main)?.location_name || 
                       'Seleccionar sede'}
                    </Text>
                  </HStack>
                  <Ionicons name="chevron-forward" size={16} color="$text400" />
                </HStack>
              </Box>
            )}
          </Pressable>
        )}
      </VStack>

      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <VStack space="xs" p="$4" width="$full">
            <Heading size="md">Cambiar Espacio</Heading>
            <Text size="sm" color="$text500">Selecciona el negocio o perfil que quieres usar</Text>
          </VStack>

          <Divider />

          {/* Opción Perfil Personal */}
          <ActionsheetItem onPress={() => handleSwitchOrg(null)}>
            <HStack space="md" alignItems="center">
              <Ionicons name="person-outline" size={20} color={!activeOrg ? "$primary600" : "$text500"} />
              <ActionsheetItemText 
                fontWeight={!activeOrg ? "$bold" : "$normal"}
                color={!activeOrg ? "$primary700" : "$text900"}
              >
                Mi Perfil Personal (Dueño)
              </ActionsheetItemText>
            </HStack>
          </ActionsheetItem>

          {/* Lista de Organizaciones */}
          {memberships.map((membership) => (
            <ActionsheetItem 
              key={membership.organization.id} 
              onPress={() => handleSwitchOrg(membership.organization.id)}
            >
              <HStack space="md" alignItems="center">
                <Ionicons 
                  name="briefcase-outline" 
                  size={20} 
                  color={activeOrg?.id === membership.organization.id ? "$primary600" : "$text500"} 
                />
                <ActionsheetItemText
                  fontWeight={activeOrg?.id === membership.organization.id ? "$bold" : "$normal"}
                  color={activeOrg?.id === membership.organization.id ? "$primary700" : "$text900"}
                >
                  {membership.organization.name}
                </ActionsheetItemText>
              </HStack>
            </ActionsheetItem>
          ))}

          <Divider my="$2" />

          {/* Opción Añadir Negocio */}
          <ActionsheetItem onPress={handleAddNewBusiness}>
            <HStack space="md" alignItems="center">
              <Ionicons name="add-circle-outline" size={20} color="$primary600" />
              <ActionsheetItemText color="$primary600" fontWeight="$bold">
                Registrar nuevo negocio
              </ActionsheetItemText>
            </HStack>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>

      {/* Actionsheet para seleccionar sede */}
      <Actionsheet isOpen={showLocationSheet} onClose={handleCloseLocationSheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          
          <VStack space="xs" p="$4" width="$full">
            <Heading size="md">Seleccionar Sede</Heading>
            <Text size="sm" color="$text500">Elige la sede en la que trabajarás</Text>
          </VStack>

          <Divider />

          {isLoadingLocations ? (
            <Center p="$8">
              <Text>Cargando sedes...</Text>
            </Center>
          ) : (
            locations.map((location) => (
              <ActionsheetItem 
                key={location.location_id}
                onPress={() => handleSwitchLocation(location.location_id)}
              >
                <HStack space="md" alignItems="center" width="$full">
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={activeLocationId === location.location_id ? "$primary600" : "$text500"} 
                  />
                  <VStack flex={1}>
                    <ActionsheetItemText
                      fontWeight={activeLocationId === location.location_id ? "$bold" : "$normal"}
                      color={activeLocationId === location.location_id ? "$primary700" : "$text900"}
                    >
                      {location.location_name}
                    </ActionsheetItemText>
                    {location.is_main && (
                      <Text size="xs" color="$primary600">
                        Sede Principal
                      </Text>
                    )}
                  </VStack>
                  {activeLocationId === location.location_id && (
                    <Ionicons name="checkmark-circle" size={20} color="$primary600" />
                  )}
                </HStack>
              </ActionsheetItem>
            ))
          )}
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}

