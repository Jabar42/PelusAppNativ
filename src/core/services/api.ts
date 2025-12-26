// Cliente API base para llamadas al backend (Netlify Functions)
// Utiliza fetch nativo para máxima compatibilidad con Expo/React Native.

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '/.netlify/functions';

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
          error: data?.error || response.statusText,
          status,
        };
      }

      return {
        data: data as T,
        status,
      };
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        error: error.message || 'Network Error',
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

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, token);
  }
}

export const apiClient = new ApiClient();
