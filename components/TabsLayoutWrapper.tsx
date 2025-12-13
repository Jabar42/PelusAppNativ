import React, { useState, useRef, useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import ResponsiveNavigation from './ResponsiveNavigation';

export default function TabsLayoutWrapper() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [navProps, setNavProps] = useState<any>(null);
  const prevStateIndexRef = useRef<number>(-1);

  // Función para capturar las props del tabBar sin causar loops
  const handleTabBar = useCallback((props: any) => {
    if (isLargeScreen) {
      // Solo actualizar si el índice de estado realmente cambió
      const currentIndex = props.state?.index ?? -1;
      if (currentIndex !== prevStateIndexRef.current) {
        prevStateIndexRef.current = currentIndex;
        setNavProps(props);
      }
      return null; // Ocultar tabBar en desktop
    }
    // En móvil, renderizar MobileMenu como tabBar
    return <ResponsiveNavigation {...props} />;
  }, [isLargeScreen]);

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column' }}>
      {isLargeScreen && navProps && (
        <View style={{ width: 250 }}>
          <ResponsiveNavigation {...navProps} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={handleTabBar}
          screenOptions={{ 
            headerShown: false,
            tabBarStyle: { display: 'none' } // Ocultar tab bar nativo
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="fav" options={{ title: 'Favoritos' }} />
          <Tabs.Screen name="pro" options={{ title: 'Perfil' }} />
          <Tabs.Screen 
            name="settings" 
            options={{ title: 'Configuración', tabBarButton: () => null }} 
          />
          <Tabs.Screen 
            name="help" 
            options={{ title: 'Ayuda', tabBarButton: () => null }} 
          />
        </Tabs>
      </View>
    </View>
  );
}

