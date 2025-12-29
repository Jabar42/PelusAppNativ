import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';
import { createSupabaseClient } from '../services/supabase';

/**
 * Hook de React para obtener un cliente de Supabase vinculado a Clerk.
 * 
 * Este hook integra la "Identidad Unificada" con la capa de persistencia.
 * El cliente devuelto tiene un interceptor que inyecta automáticamente 
 * el JWT de Clerk (template 'supabase') en cada petición.
 * 
 * @returns SupabaseClient autenticado
 */
export const useSupabaseClient = () => {
  const { getToken } = useAuth();

  return useMemo(() => {
    return createSupabaseClient(getToken);
  }, [getToken]);
};





