import React from 'react';
import { Platform, Pressable } from 'react-native';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';
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

  // Filtrar tabs según el rol del usuario
  const getVisibleTabs = () => {
    if (isLoading || !userRole) return [];
    return allTabs.filter(tab => !tab.roles || tab.roles.includes(userRole));
  };

  const visibleTabs = getVisibleTabs();
  const visibleTabNames = visibleTabs.map(t => t.name);

  // Filtrar las rutas del state para mostrar solo las visibles
  const visibleRoutes = state.routes.filter((route: any) => 
    visibleTabNames.includes(route.name)
  );

  return (
    <HStack
      className="h-14 w-full bg-white border-t border-gray-200 shadow-lg"
      style={{
        ...(Platform.OS === 'web' ? {
          boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
        } : {
          elevation: 8,
        }),
      } as any}
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
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center py-2"
          >
            <VStack alignItems="center" gap={4}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? '#1C1B1F' : '#A09CAB'}
              />
              <Text
                className={`text-xs font-medium mt-1 ${
                  isFocused ? 'text-gray-900' : 'text-gray-500'
                }`}
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


