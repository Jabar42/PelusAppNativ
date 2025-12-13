import React, { useState, useRef, useCallback } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import ResponsiveNavigation from './ResponsiveNavigation';

export default function TabsLayoutWrapper() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [navProps, setNavProps] = useState<any>(null);
  const navPropsRef = useRef<any>(null);
  const updateScheduledRef = useRef(false);

  // Función para capturar las props del tabBar sin causar loops
  const handleTabBar = useCallback((props: any) => {
    if (isLargeScreen) {
      // Guardar las props en el ref
      navPropsRef.current = props;
      
      // Programar actualización solo si no hay una ya programada
      if (!updateScheduledRef.current) {
        updateScheduledRef.current = true;
        // Usar requestAnimationFrame para actualizar después del render
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            setNavProps(navPropsRef.current);
            updateScheduledRef.current = false;
          });
        } else {
          // Fallback para entornos sin requestAnimationFrame
          setTimeout(() => {
            setNavProps(navPropsRef.current);
            updateScheduledRef.current = false;
          }, 0);
        }
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

