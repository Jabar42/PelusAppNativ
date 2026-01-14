import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Check your .env file (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

// Singleton para evitar múltiples instancias
let supabaseClientInstance: SupabaseClient | null = null;
let currentGetToken: ((options: { template: string }) => Promise<string | null>) | null = null;

/**
 * Factory para crear un cliente de Supabase con "Smart Refresh".
 * 
 * Esta factoría utiliza un custom fetch que intercepta cada petición
 * para inyectar un token fresco de Clerk. Esto garantiza que el RLS 
 * de Supabase siempre reciba un JWT válido incluso si el usuario
 * mantiene la sesión abierta por mucho tiempo.
 * 
 * Implementa un patrón Singleton para evitar múltiples instancias.
 * 
 * @param getToken - Función asíncrona que retorna el token de Clerk (ej. useAuth().getToken)
 * @returns Cliente de Supabase configurado (singleton)
 */
export const createSupabaseClient = (getToken: (options: { template: string }) => Promise<string | null>) => {
  // Si ya existe una instancia y la función getToken es la misma, reutilizar
  if (supabaseClientInstance && currentGetToken === getToken) {
    return supabaseClientInstance;
  }

  // Crear nueva instancia solo si es necesario
  currentGetToken = getToken;
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        try {
          // 1. Obtener token fresco del template 'supabase' de Clerk
          const token = await getToken({ template: 'supabase' });
          
          // 2. Inyectar en los headers
          const headers = new Headers(options.headers);
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          } else {
            console.warn('[Supabase] No token available. RLS policies may fail.');
          }
          
          // 3. Ejecutar fetch original con headers actualizados
          const response = await fetch(url, {
            ...options,
            headers,
          });

          // 4. Si hay error de RLS, verificar si es por falta de claims
          if (!response.ok) {
            const errorText = await response.text();
            if (errorText.includes('row-level security policy')) {
              console.error(
                '[Supabase RLS Error] El JWT puede no tener los claims necesarios.\n' +
                'Verifica que el template "supabase" en Clerk tenga:\n' +
                '- user_id: {{user.id}}\n' +
                '- org_id: {{org.id}}\n' +
                '- org_role: {{org.role}}\n' +
                '- active_location_id: {{org.publicMetadata.active_location_id}}\n' +
                'Error:', errorText
              );
            }
          }

          return response;
        } catch (error) {
          console.error('[Supabase] Error en fetch interceptor:', error);
          throw error;
        }
      },
    },
  });

  return supabaseClientInstance;
};

/**
 * Cliente estático (solo para uso público o inicialización fuera de React)
 * Nota: El RLS fallará si se intenta acceder a datos protegidos con este cliente.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);





