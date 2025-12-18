import { ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import { tokenCache } from '@/core/services/storage';
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
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <Slot />
    </ClerkProvider>
  );
}
