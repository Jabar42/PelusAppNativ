import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Check your .env file (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

// Singleton para evitar múltiples instancias
// Usamos un WeakMap para asociar instancias con funciones getToken
// pero como getToken puede cambiar, usamos una única instancia global
let supabaseClientInstance: SupabaseClient | null = null;

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
  // Si ya existe una instancia, reutilizarla
  // El getToken se captura en el closure del fetch interceptor, así que siempre usará la versión actual
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Crear nueva instancia solo una vez
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        try {
          // 1. Obtener token fresco del template 'supabase' de Clerk
          const token = await getToken({ template: 'supabase' });
          
          // 2. Preparar headers preservando los existentes
          const headers = new Headers(options.headers);
          
          // Headers requeridos por PostgREST para evitar error 406 (Not Acceptable)
          // Estos headers son necesarios para que PostgREST procese correctamente las queries
          headers.set('Accept', 'application/json');
          headers.set('Content-Type', 'application/json');
          headers.set('Prefer', 'return=representation');
          
          // Inyectar token de Clerk para RLS
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

          // 4. Manejo de errores con diagnóstico mejorado
          // IMPORTANTE: Clonar la respuesta antes de leer el body para no consumir el stream
          if (!response.ok) {
            // Clonar la respuesta para poder leer el body sin consumir el stream original
            const clonedResponse = response.clone();
            try {
              const errorText = await clonedResponse.text();
              
              // Error 406: Not Acceptable - generalmente por headers faltantes
              if (response.status === 406) {
                console.error(
                  '[Supabase 406 Error] PostgREST rechazó la petición.\n' +
                  'Esto generalmente indica que faltan headers requeridos.\n' +
                  'URL:', url.toString(), '\n' +
                  'Headers enviados:', Object.fromEntries(headers.entries()), '\n' +
                  'Error:', errorText
                );
              }
              
              // Error de RLS
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
            } catch (err) {
              // Si falla al leer el error, no es crítico, solo loguear
              console.warn('[Supabase] No se pudo leer el mensaje de error:', err);
            }
          }

          // Devolver la respuesta original (sin leer el body)
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





