import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache } from '@/core/services/storage';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui.config';
import '../global.css';
import { useAuthSync } from '@/features/Auth/hooks/useAuthSync';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env file'
  );
}

/**
 * Wrapper para sincronizar el estado de autenticación de forma global.
 * Asegura que useAuthSync esté activo en toda la aplicación, manteniendo
 * el authStore actualizado con los datos de Clerk.
 */
function AuthSyncWrapper({ children }: { children: React.ReactNode }) {
  useAuthSync();
  return <>{children}</>;
}

// Manejo global de errores de carga (Clerk y Chunks)
if (typeof window !== 'undefined') {
  // Limpiar el flag de reload al cargar la página exitosamente
  window.addEventListener('load', () => {
    setTimeout(() => {
      sessionStorage.removeItem('appErrorReloaded');
    }, 5000);
  });

  const handleResourceError = (errorMessage: string) => {
    const isCriticalError = 
      errorMessage.includes('Loading chunk') || 
      errorMessage.includes('chunk') ||
      errorMessage.includes('clerk') ||
      errorMessage.includes('failed_to_load_clerk');

    if (isCriticalError) {
      console.warn('Critical loading error detected:', errorMessage);
      
      const hasReloaded = sessionStorage.getItem('appErrorReloaded');
      if (!hasReloaded) {
        console.log('Initiating recovery reload with extended backoff (3s)...');
        sessionStorage.setItem('appErrorReloaded', 'true');
        
        // Extended backoff: dar más tiempo a la red local y a Clerk para estabilizarse
        setTimeout(() => {
          // Solo recargar si no estamos en una sesión de depuración activa que pueda interferir
          if (typeof window !== 'undefined' && !window.location.search.includes('debug')) {
            window.location.reload();
          }
        }, 3000);
      } else {
        console.error('Critical error persists after auto-reload. Please check your internet connection or ad-blockers.');
      }
    }
  };

  window.addEventListener('error', (event) => {
    const errorMessage = event.message || event.error?.message || '';
    handleResourceError(errorMessage);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorMessage = typeof reason === 'string' 
      ? reason 
      : reason?.message || reason?.toString() || '';
    
    handleResourceError(errorMessage);
  });
}

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <GluestackUIProvider config={config}>
        <AuthSyncWrapper>
          <Slot />
        </AuthSyncWrapper>
      </GluestackUIProvider>
    </ClerkProvider>
  );
}
