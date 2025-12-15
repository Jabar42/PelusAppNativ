import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  name: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
}

interface MobileMenuProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabs: TabItem[] = [
  { name: 'index', label: 'HOME', iconOutline: 'home-outline', iconFilled: 'home' },
  { name: 'fav', label: 'FAV', iconOutline: 'heart-outline', iconFilled: 'heart' },
  { name: 'pro', label: 'PRO', iconOutline: 'person-outline', iconFilled: 'person' },
];

export default function MobileMenu({ state, descriptors, navigation }: MobileMenuProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

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

        const tab = tabs.find(t => t.name === route.name);
        const iconName = isFocused 
          ? (tab?.iconFilled || 'home') 
          : (tab?.iconOutline || 'home-outline');

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#1C1B1F' : '#A09CAB'}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? '#1C1B1F' : '#A09CAB' },
              ]}
            >
              {tab?.label || route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    // El tabBar de expo-router maneja el posicionamiento sticky
    elevation: 8,
    // Usar solo boxShadow para web, eliminar shadow* props para evitar warnings
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
    } : {}),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});




