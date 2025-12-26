import React from 'react';
import { Box, Text, VStack, HStack, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useOrganization } from '@clerk/clerk-expo';
import { useAuthStore } from '@/core/store/authStore';

interface TabItem {
  name: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  context?: 'B2B' | 'B2C' | 'BOTH'; // Contexto en el que es visible
}

interface MobileMenuProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const allTabs: TabItem[] = [
  { name: 'index', label: 'HOME', iconOutline: 'home-outline', iconFilled: 'home', context: 'BOTH' },
  { name: 'fav', label: 'FAV', iconOutline: 'heart-outline', iconFilled: 'heart', context: 'B2C' }, // Solo Personal
  { name: 'pro', label: 'PRO', iconOutline: 'person-outline', iconFilled: 'person', context: 'BOTH' },
  { name: 'help', label: 'AYUDA', iconOutline: 'help-circle-outline', iconFilled: 'help-circle', context: 'BOTH' },
  { name: 'settings', label: 'CONFIG', iconOutline: 'settings-outline', iconFilled: 'settings', context: 'BOTH' },
];

export default function MobileMenu({ state, descriptors, navigation }: MobileMenuProps) {
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const { isLoading: authLoading } = useAuthStore();
  
  const activeColor = useToken('colors', 'textLight900');
  const inactiveColor = useToken('colors', 'textLight400');
  const iconSize = useToken('space', '6');

  // Determinar el contexto actual. Si no ha cargado, asumimos B2C para evitar que las pestañas desaparezcan.
  const currentContext = organization ? 'B2B' : 'B2C';

  // Filtrar tabs según el contexto actual
  const getVisibleTabs = () => {
    // Si está cargando el perfil profesional, mostramos al menos las comunes
    // para evitar que el menú desaparezca por completo (flickering).
    const showOnlyBoth = !orgLoaded || authLoading;
    
    return allTabs.filter(tab => {
      if (showOnlyBoth) return tab.context === 'BOTH';
      return tab.context === 'BOTH' || tab.context === currentContext;
    });
  };

  const visibleTabs = getVisibleTabs();
  const visibleTabNames = visibleTabs.map(t => t.name);

  // Filtrar las rutas del state para mostrar solo las visibles
  // IMPORTANTE: El orden de renderizado en MobileMenu depende del orden en visibleTabNames
  // para que sea consistente con Sidebar, en lugar de depender del orden en state.routes
  const visibleRoutes = visibleTabNames
    .map(name => state.routes.find((r: any) => r.name === name))
    .filter(Boolean);

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
      {visibleRoutes.map((route: any) => {
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
