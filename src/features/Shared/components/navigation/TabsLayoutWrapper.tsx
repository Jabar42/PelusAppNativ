import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { Tabs, useRouter } from 'expo-router';
import ResponsiveNavigation from './ResponsiveNavigation';
import UserAvatarHeader from './UserAvatarHeader';
import { useOrganization, useAuth } from '@clerk/clerk-expo';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { AIFloatingButton } from '@/features/AI_Core/components/AIFloatingButton';
import { AICommandBar } from '@/features/AI_Core/components/AICommandBar';
import { useAIStore } from '@/core/store/aiStore';

export default function TabsLayoutWrapper() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const [navProps, setNavProps] = useState<any>(null);
  const navPropsRef = useRef<any>(null);
  const updateScheduledRef = useRef(false);
  const { organization } = useOrganization();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const router = useRouter();
  const { isCommandBarOpen, openCommandBar, closeCommandBar } = useAIStore();

  // Protección de sesión: si el usuario no está logueado y Clerk ya cargó,
  // evitamos renderizar las pestañas para prevenir parpadeos durante el logout.
  if (authLoaded && !isSignedIn) {
    return <LoadingScreen />;
  }

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
      // Retornar Box vacío en lugar de null para evitar errores de DOM
      return <Box style={{ display: 'none' }} />;
    }
    // En móvil, renderizar MobileMenu como tabBar (sticky)
    return <ResponsiveNavigation {...props} />;
  }, [isLargeScreen]);

  return (
    <Box 
      flex={1} 
      className="overflow-hidden w-full h-full"
      style={{ flexDirection: isLargeScreen ? 'row' : 'column' }}
    >
      {isLargeScreen && navProps && (
        <Box className="w-[250px] h-full">
          <ResponsiveNavigation {...navProps} />
        </Box>
      )}
      <Box flex={1} className="w-full h-full overflow-hidden">
        <Tabs
          tabBar={handleTabBar}
          screenOptions={{ 
            headerShown: true,
            headerTitleAlign: 'center',
            headerRight: () => <UserAvatarHeader />,
            headerTitle: () => (
              <Box maxWidth="$64">
                <Text 
                  fontWeight="$bold" 
                  size="lg" 
                  color="$text900" 
                  numberOfLines={1} 
                  ellipsizeMode="tail"
                >
                  {organization?.name ?? "Mis Mascotas"}
                </Text>
              </Box>
            ),
            headerStyle: {
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            },
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
          {/* Definir todas las rutas de tabs de forma estática.
              La visibilidad por contexto se maneja en MobileMenu / Sidebar */}
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="fav" options={{ title: 'Favoritos' }} />
          <Tabs.Screen 
            name="pro" 
            options={{ 
              title: 'Perfil',
              tabBarButton: () => null, // Ocultar de la barra inferior
            }} 
          />
          <Tabs.Screen
            name="help"
            options={{ title: 'Ayuda', tabBarButton: () => null }}
          />
          <Tabs.Screen
            name="settings"
            options={{ title: 'Configuración', tabBarButton: () => null }}
          />
          <Tabs.Screen
            name="locations-management"
            options={{ title: 'Gestión de Sedes', tabBarButton: () => null }}
          />
        </Tabs>
      </Box>
      
      {/* AI Floating Button y Command Bar */}
      <AIFloatingButton onPress={openCommandBar} />
      <AICommandBar isOpen={isCommandBarOpen} onClose={closeCommandBar} />
    </Box>
  );
}
