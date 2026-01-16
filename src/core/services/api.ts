import { Platform } from 'react-native';

/**
 * Cliente API base para llamadas al backend (Netlify Functions).
 * 
 * Lógica de URL:
 * 1. En Web: Preferimos rutas relativas '/.netlify/functions' para evitar problemas de CORS y Mixed Content.
 * 2. En Mobile: Necesitamos la URL absoluta definida en EXPO_PUBLIC_API_URL.
 */
const getBaseURL = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (Platform.OS === 'web') {
    // Si estamos en web y la URL de env apunta a localhost pero el navegador no,
    // usamos una ruta relativa para que el proxy (o el mismo dominio) lo maneje.
    if (typeof window !== 'undefined' && envUrl?.includes('localhost') && !window.location.hostname.includes('localhost')) {
      return '/.netlify/functions';
    }
    return envUrl || '/.netlify/functions';
  }
  
  return envUrl || 'http://localhost:8888/.netlify/functions';
};

const API_BASE_URL = getBaseURL();

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const status = response.status;
      let data;
      
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          error: data?.error || response.statusText || `Error ${status}`,
          status,
        };
      }

      return {
        data: data as T,
        status,
      };
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Mejorar mensajes de error según el tipo
      let errorMessage = 'Error de conexión';
      if (error.message?.includes('fetch failed')) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que Netlify Dev esté corriendo.';
      } else if (error.message?.includes('Network request failed')) {
        errorMessage = 'Error de red. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        error: errorMessage,
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, token);
  }

  async post<T>(endpoint: string, data: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async put<T>(endpoint: string, data: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async delete<T>(endpoint: string, token?: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: 'DELETE' };
    if (body) {
      options.body = JSON.stringify(body);
    }
    return this.request<T>(endpoint, options, token);
  }
}

export const apiClient = new ApiClient();
