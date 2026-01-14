import { useAuth } from '@clerk/clerk-expo';
import { useMemo, useRef } from 'react';
import { createSupabaseClient } from '../services/supabase';

/**
 * Hook de React para obtener un cliente de Supabase vinculado a Clerk.
 * 
 * Este hook integra la "Identidad Unificada" con la capa de persistencia.
 * El cliente devuelto tiene un interceptor que inyecta automáticamente 
 * el JWT de Clerk (template 'supabase') en cada petición.
 * 
 * Implementa un patrón Singleton para evitar múltiples instancias.
 * 
 * @returns SupabaseClient autenticado (singleton)
 */
export const useSupabaseClient = () => {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  // Actualizar la referencia cuando getToken cambia
  getTokenRef.current = getToken;

  // Crear una función estable que siempre use la referencia actual
  const stableGetToken = useMemo(
    () => (options: { template: string }) => getTokenRef.current(options),
    []
  );

  return useMemo(() => {
    return createSupabaseClient(stableGetToken);
  }, [stableGetToken]);
};





