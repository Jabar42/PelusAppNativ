import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache } from '@/core/services/storage';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { useColorScheme } from 'nativewind';
import { useEffect, useCallback } from 'react';
import '../global.css';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file'
  );
}

// Manejo global de errores de chunk loading de Clerk
if (typeof window !== 'undefined') {
  // Limpiar el flag de reload al cargar la página
  window.addEventListener('load', () => {
    // Limpiar después de 5 segundos para permitir recargas futuras si es necesario
    setTimeout(() => {
      sessionStorage.removeItem('chunkErrorReloaded');
    }, 5000);
  });

  window.addEventListener('error', (event) => {
    const errorMessage = event.message || event.error?.message || '';
    if (errorMessage.includes('Loading chunk') || errorMessage.includes('chunk')) {
      console.warn('Chunk loading error detected:', errorMessage);
      // Solo recargar una vez para evitar loops infinitos
      const hasReloaded = sessionStorage.getItem('chunkErrorReloaded');
      if (!hasReloaded) {
        console.log('Reloading page to fix chunk error...');
        sessionStorage.setItem('chunkErrorReloaded', 'true');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.error('Chunk error persists after reload. Please clear browser cache.');
      }
    }
  });

  // También manejar errores no capturados de promesas
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMessage = typeof reason === 'string' 
      ? reason 
      : reason?.message || reason?.toString() || '';
    
    if (errorMessage.includes('Loading chunk') || errorMessage.includes('chunk')) {
      console.warn('Chunk loading promise rejection detected:', errorMessage);
      const hasReloaded = sessionStorage.getItem('chunkErrorReloaded');
      if (!hasReloaded) {
        console.log('Reloading page to fix chunk promise rejection...');
        sessionStorage.setItem('chunkErrorReloaded', 'true');
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    }
  });
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Detectar preferencia del sistema en la primera carga
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Detectar preferencia del sistema si no hay un colorScheme establecido
      if (colorScheme === undefined || colorScheme === null) {
        const prefersDark = mediaQuery.matches;
        setColorScheme(prefersDark ? 'dark' : 'light');
      }
    }
  }, []); // Solo ejecutar una vez al montar

  // Aplicar clase dark al elemento raíz del DOM cuando cambie el colorScheme
  useEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
      const root = window.document.documentElement;
      
      if (colorScheme === 'dark') {
        root.classList.add('dark');
      } else if (colorScheme === 'light') {
        root.classList.remove('dark');
      }
    }
  }, [colorScheme]);

  // Crear handler estable usando useCallback para evitar memory leaks
  // Con userInterfaceStyle: "automatic", siempre seguimos la preferencia del sistema
  const handleSystemPreferenceChange = useCallback((e: MediaQueryListEvent) => {
    setColorScheme(e.matches ? 'dark' : 'light');
  }, [setColorScheme]);

  // Escuchar cambios en la preferencia del sistema (solo una vez al montar)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Agregar listener para cambios en la preferencia del sistema
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemPreferenceChange);
        return () => {
          mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
        };
      } else {
        // Fallback para navegadores antiguos
        mediaQuery.addListener(handleSystemPreferenceChange);
        return () => {
          mediaQuery.removeListener(handleSystemPreferenceChange);
        };
      }
    }
  }, [handleSystemPreferenceChange]); // Usar la función estable de useCallback

  // Determinar el modo para GluestackUIProvider
  // Usar 'light' como fallback si colorScheme aún no está disponible
  const mode = (colorScheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <GluestackUIProvider config={config} mode={mode}>
        <Slot />
      </GluestackUIProvider>
    </ClerkProvider>
  );
}
