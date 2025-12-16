import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      // Importante: siempre regresar al flujo inicial de loading
      // para que la lógica central decida si mostrar login o role-select
      router.replace('/(initial)/loading');
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          PelusApp
        </Text>
      </View>
      
      <View style={styles.menu}>
        {visibleMenuItems.map((item) => {
          const isActive = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleNavigation(item.route)}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
              ]}
            >
              <Ionicons
                name={isActive ? item.icon : (`${item.icon}-outline` as any)}
                size={24}
                color={isActive ? '#1C1B1F' : '#A09CAB'}
              />
              <Text
                style={[
                  styles.menuItemText,
                  { color: isActive ? '#1C1B1F' : '#A09CAB' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          <Text style={styles.signOutText}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  menu: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#DC2626',
  },
});


