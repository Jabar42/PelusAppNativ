import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Check your .env file (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

/**
 * Factory para crear un cliente de Supabase con "Smart Refresh".
 * 
 * Esta factoría utiliza un custom fetch que intercepta cada petición
 * para inyectar un token fresco de Clerk. Esto garantiza que el RLS 
 * de Supabase siempre reciba un JWT válido incluso si el usuario
 * mantiene la sesión abierta por mucho tiempo.
 * 
 * @param getToken - Función asíncrona que retorna el token de Clerk (ej. useAuth().getToken)
 * @returns Cliente de Supabase configurado
 */
export const createSupabaseClient = (getToken: (options: { template: string }) => Promise<string | null>) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        // 1. Obtener token fresco del template 'supabase' de Clerk
        const token = await getToken({ template: 'supabase' });
        
        // 2. Inyectar en los headers
        const headers = new Headers(options.headers);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        
        // 3. Ejecutar fetch original con headers actualizados
        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
};

/**
 * Cliente estático (solo para uso público o inicialización fuera de React)
 * Nota: El RLS fallará si se intenta acceder a datos protegidos con este cliente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);





