import { useAuth } from '@clerk/clerk-expo';
import { useMemo, useRef, useEffect } from 'react';
import { createSupabaseClient } from '../services/supabase';

/**
 * Hook de React para obtener un cliente de Supabase vinculado a Clerk.
 * 
 * Este hook integra la "Identidad Unificada" con la capa de persistencia.
 * El cliente devuelto tiene un interceptor que inyecta automáticamente 
 * el JWT de Clerk (template 'supabase') en cada petición.
 * 
 * Implementa un patrón Singleton para evitar múltiples instancias.
 * El getToken se captura en el closure del fetch interceptor, así que
 * siempre usará la versión más reciente sin necesidad de recrear el cliente.
 * 
 * @returns SupabaseClient autenticado (singleton)
 */
export const useSupabaseClient = () => {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  // Actualizar la referencia cuando getToken cambia
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Crear una función estable que siempre use la referencia actual
  // Esta función se captura en el closure del fetch interceptor
  const stableGetToken = useMemo(
    () => (options: { template: string }) => getTokenRef.current(options),
    [] // Array vacío porque siempre usamos la referencia actual
  );

  // El cliente es un singleton, se crea solo una vez
  // El getToken dentro del interceptor siempre usará la versión actual
  return useMemo(() => {
    return createSupabaseClient(stableGetToken);
  }, []); // Array vacío porque es un singleton
};





