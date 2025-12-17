import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text, HStack, VStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/core/store/authStore';

interface MenuItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  isAction?: boolean;
  roles?: ('B2B' | 'B2C')[]; // Roles que pueden ver este item
}

interface SidebarProps {
  state?: any;
  descriptors?: any;
  navigation?: any;
}

const allMenuItems: MenuItem[] = [
  { name: 'index', label: 'Home', icon: 'home', route: '/(tabs)/index', roles: ['B2B', 'B2C'] },
  { name: 'fav', label: 'Favoritos', icon: 'heart', route: '/(tabs)/fav', roles: ['B2C'] }, // Solo B2C
  { name: 'pro', label: 'Perfil', icon: 'person', route: '/(tabs)/pro', roles: ['B2B', 'B2C'] },
  { name: 'settings', label: 'Configuración', icon: 'settings', route: '/(tabs)/settings', roles: ['B2B', 'B2C'] },
  { name: 'help', label: 'Ayuda', icon: 'help-circle', route: '/(tabs)/help', roles: ['B2B', 'B2C'] },
];

export default function Sidebar({ state, navigation }: SidebarProps) {
  const { signOut } = useClerkAuth();
  const router = useRouter();
  const { userRole, isLoading, clearAuth } = useAuthStore();

  // Filtrar items del menú según el rol del usuario
  const getVisibleMenuItems = () => {
    if (isLoading || !userRole) return [];
    return allMenuItems.filter(item => !item.roles || item.roles.includes(userRole));
  };

  const visibleMenuItems = getVisibleMenuItems();

  const handleNavigation = (route: string) => {
    const routeName = route.split('/').pop() || 'index';
    
    if (navigation && state) {
      const targetRoute = state.routes?.find((r: any) => r.name === routeName);
      if (targetRoute) {
        const event = navigation.emit({
          type: 'tabPress',
          target: targetRoute.key,
          canPreventDefault: true,
        });
        
        if (!event.defaultPrevented) {
          navigation.navigate(routeName);
        }
      } else {
        router.push(route as any);
      }
    } else {
      router.push(route as any);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Limpiar el estado de autenticación en Zustand
      clearAuth();
      // Importante: siempre regresar al flujo inicial de loading
      // para que la lógica central decida si mostrar login o role-select
      router.replace('/(initial)/loading');
    } catch (error) {
      console.error('Error signing out:', error);
      // Limpiar el estado incluso si hay un error en signOut
      clearAuth();
    }
  };

  const getActiveRoute = () => {
    if (state?.routes && state.index !== undefined) {
      return state.routes[state.index]?.name || 'index';
    }
    return 'index';
  };

  const activeRoute = getActiveRoute();

  return (
    <Box className="w-[250px] h-full bg-white border-r border-gray-200">
      <Box className="py-4 px-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">
          PelusApp
        </Text>
      </Box>
      
      <VStack flex={1} className="py-2">
        {visibleMenuItems.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <Pressable
              key={item.name}
              onPress={() => handleNavigation(item.route)}
            >
              <HStack
                className={`px-4 py-3 mx-2 my-1 rounded-lg items-center ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <Ionicons
                  name={isActive ? item.icon : (`${item.icon}-outline` as any)}
                  size={24}
                  color={isActive ? '#1C1B1F' : '#A09CAB'}
                />
                <Text
                  className={`text-base font-medium ml-3 ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </VStack>

      <Box className="py-4 px-4 border-t border-gray-200">
        <Pressable onPress={handleSignOut}>
          <HStack className="px-4 py-3 rounded-lg items-center bg-red-50">
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            <Text className="text-base font-medium ml-3 text-red-600">
              Cerrar sesión
            </Text>
          </HStack>
        </Pressable>
      </Box>
    </Box>
  );
}


