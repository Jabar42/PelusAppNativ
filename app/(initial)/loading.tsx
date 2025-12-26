import React, { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { useAuthStore } from '@/core/store/authStore';
import { useAuthSync } from '@/features/Auth/hooks/useAuthSync';

/**
 * Orquestador de carga inicial.
 * Implementa la lógica de "Identidad Unificada": todos los usuarios
 * autenticados van al mismo punto de entrada (/(tabs)).
 */
export default function InitialLoadingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const { isLoading: authLoading } = useAuthStore();
  const hasNavigatedRef = useRef(false);
  const previousSignedInRef = useRef<boolean | undefined>(undefined);

  // Sincronizar estado de Clerk con Store local
  useAuthSync();

  // Resetear el flag de navegación si el estado de autenticación cambia
  useEffect(() => {
    if (
      previousSignedInRef.current !== undefined &&
      previousSignedInRef.current !== isSignedIn
    ) {
      hasNavigatedRef.current = false;
    }
    previousSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    // Evitar múltiples navegaciones simultáneas
    if (hasNavigatedRef.current) return;
    
    // Esperar a que Clerk y la sincronización estén listas
    if (!isLoaded || authLoading) return;

    hasNavigatedRef.current = true;

    if (!isSignedIn) {
      // Si no hay sesión, ir al Login Universal
      // NOTA: Se elimina role-select del flujo crítico
      router.replace('/(auth)/login');
      return;
    }

    // Si hay sesión, ir directamente al Dashboard (Tabs)
    // El Dashboard se encargará de decidir qué vista mostrar (B2B o B2C)
    router.replace('/(tabs)');
    
  }, [isLoaded, authLoading, isSignedIn, router]);

  return <LoadingScreen />;
}
