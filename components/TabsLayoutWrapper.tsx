import React, { useState, useRef, useCallback } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
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
      // Retornar View vacío en lugar de null para evitar errores de DOM
      return <View style={{ display: 'none' }} />;
    }
    // En móvil, renderizar MobileMenu como tabBar (sticky)
    return <ResponsiveNavigation {...props} />;
  }, [isLargeScreen]);

  return (
    <View style={[styles.container, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
      {isLargeScreen && navProps && (
        <View style={styles.sidebar}>
          <ResponsiveNavigation {...navProps} />
        </View>
      )}
      <View style={styles.content}>
        <Tabs
          tabBar={handleTabBar}
          screenOptions={{ 
            headerShown: false,
            tabBarStyle: isLargeScreen 
              ? { display: 'none' } // Ocultar tab bar nativo en desktop
              : {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 56,
                  borderTopWidth: 0,
                  elevation: 8,
                },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden', // Prevenir scrolls no deseados
    width: '100%',
    height: '100%',
  },
  sidebar: {
    width: 250,
    height: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden', // Prevenir scrolls horizontales
  },
});




