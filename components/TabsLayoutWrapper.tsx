import React, { useState, useRef, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import ResponsiveNavigation from './ResponsiveNavigation';

export default function TabsLayoutWrapper() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [navProps, setNavProps] = useState<any>(null);
  const navPropsRef = useRef<any>(null);

  // Componente interno para capturar las props del tabBar
  const TabBarWrapper = (props: any) => {
    useEffect(() => {
      if (isLargeScreen && props.state) {
        navPropsRef.current = props;
        setNavProps(props);
      }
    }, [props.state, isLargeScreen]);

    if (isLargeScreen) {
      return null; // Ocultar tabBar en desktop
    }
    // En móvil, renderizar MobileMenu como tabBar
    return <ResponsiveNavigation {...props} />;
  };

  return (
    <View style={{ flex: 1, flexDirection: isLargeScreen ? 'row' : 'column' }}>
      {isLargeScreen && navProps && (
        <View style={{ width: 250 }}>
          <ResponsiveNavigation {...navProps} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Tabs
          tabBar={(props) => <TabBarWrapper {...props} />}
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

