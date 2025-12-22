import React from 'react';
import { Platform } from 'react-native';
import { Box, Text, VStack, HStack, Pressable } from '@gluestack-ui/themed';
import { useToken } from '@gluestack-style/react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/core/store/authStore';

interface TabItem {
  name: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  roles?: ('B2B' | 'B2C')[]; // Roles que pueden ver este tab
}

interface MobileMenuProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const allTabs: TabItem[] = [
  { name: 'index', label: 'HOME', iconOutline: 'home-outline', iconFilled: 'home', roles: ['B2B', 'B2C'] },
  { name: 'fav', label: 'FAV', iconOutline: 'heart-outline', iconFilled: 'heart', roles: ['B2C'] }, // Solo B2C
  { name: 'pro', label: 'PRO', iconOutline: 'person-outline', iconFilled: 'person', roles: ['B2B', 'B2C'] },
  { name: 'settings', label: 'CONFIG', iconOutline: 'settings-outline', iconFilled: 'settings', roles: ['B2B', 'B2C'] },
  { name: 'help', label: 'AYUDA', iconOutline: 'help-circle-outline', iconFilled: 'help-circle', roles: ['B2B', 'B2C'] },
];

export default function MobileMenu({ state, descriptors, navigation }: MobileMenuProps) {
  const { userRole, isLoading } = useAuthStore();
  const activeColor = useToken('colors', 'textLight900');
  const inactiveColor = useToken('colors', 'textLight400');
  const iconSize = useToken('space', '6');

  console.log('📱 MobileMenu Stats:', { userRole, isLoading, stateRoutes: state.routes.length });

  // Filtrar tabs según el rol del usuario
  const getVisibleTabs = () => {
    // Si no hay rol, forzar B2C para Storybook si detectamos que estamos en ese entorno
    const currentRole = userRole || ((window as any).__STORYBOOK_ADDONS ? 'B2C' : null);
    if (!currentRole) return [];
    return allTabs.filter(tab => !tab.roles || tab.roles.includes(currentRole as any));
  };

  const visibleTabs = getVisibleTabs();
  const visibleTabNames = visibleTabs.map(t => t.name);

  // Filtrar las rutas del state para mostrar solo las visibles
  const visibleRoutes = state.routes.filter((route: any) => 
    visibleTabNames.includes(route.name)
  );

  return (
    <HStack
      height={"$14" as any}
      width="$full"
      backgroundColor="$white"
      borderTopWidth={"$px" as any}
      borderTopColor="$borderLight200"
      hardShadow="2"
      sx={{
        _web: {
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)',
        }
      }}
    >
      {visibleRoutes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const tab = allTabs.find(t => t.name === route.name);
        const iconName = isFocused 
          ? (tab?.iconFilled || 'home') 
          : (tab?.iconOutline || 'home-outline');

        return (
          <Pressable
            key={route.key}
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingVertical="$2"
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <VStack alignItems="center" gap="$1">
              <Ionicons
                name={iconName}
                size={iconSize as any}
                color={isFocused ? activeColor : inactiveColor}
              />
              <Text
                fontSize="$xs"
                fontWeight="$medium"
                marginTop="$1"
                color={isFocused ? '$textLight900' : '$textLight500'}
              >
                {tab?.label || route.name}
              </Text>
            </VStack>
          </Pressable>
        );
      })}
    </HStack>
  );
}


