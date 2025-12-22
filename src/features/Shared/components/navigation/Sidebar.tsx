import React from 'react';
import { Box, Text, VStack, HStack, Pressable, Heading } from '@gluestack-ui/themed';
import { useToken } from '@gluestack-style/react';
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
  const { userRole, isLoading } = useAuthStore();
  
  const activeIconColor = useToken('colors', 'textLight900');
  const inactiveIconColor = useToken('colors', 'textLight400');
  const errorColor = useToken('colors', 'error600');

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
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
    <Box
      width={"$64" as any}
      height="$full"
      backgroundColor="$white"
      borderRightWidth={"$px" as any}
      borderRightColor="$borderLight200"
    >
      <Box
        paddingVertical="$4"
        paddingHorizontal="$4"
        borderBottomWidth={"$px" as any}
        borderBottomColor="$borderLight200"
      >
        <Heading size="md" color="$textLight900">
          PelusApp
        </Heading>
      </Box>
      
      <VStack flex={1} paddingVertical="$2">
        {visibleMenuItems.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <Pressable
              key={item.name}
              onPress={() => handleNavigation(item.route)}
              paddingHorizontal="$4"
              paddingVertical="$3"
              marginHorizontal="$2"
              marginVertical={"$1" as any}
              borderRadius="$md"
              backgroundColor={isActive ? '$primary50' : 'transparent'}
            >
              <HStack alignItems="center" gap="$3">
                <Ionicons
                  name={isActive ? item.icon : (`${item.icon}-outline` as any)}
                  size={24}
                  color={isActive ? activeIconColor : inactiveIconColor}
                />
                <Text
                  fontWeight={isActive ? '$bold' : '$medium'}
                  color={isActive ? '$textLight900' : '$textLight500'}
                >
                  {item.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </VStack>

      <Box
        paddingVertical="$4"
        paddingHorizontal="$4"
        borderTopWidth={"$px" as any}
        borderTopColor="$borderLight200"
      >
        <Pressable
          onPress={handleSignOut}
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderRadius="$md"
          backgroundColor="$error50"
          gap="$3"
        >
          <Ionicons name="log-out-outline" size={24} color={errorColor} />
          <Text fontWeight="$medium" color="$error600">
            Cerrar sesión
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
}


