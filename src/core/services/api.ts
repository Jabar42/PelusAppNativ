// Cliente API base para futuras llamadas
// Este archivo puede expandirse con Axios, Fetch, o cualquier cliente HTTP

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Implementación futura
    throw new Error('Not implemented');
  }

  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    // Implementación futura
    throw new Error('Not implemented');
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    // Implementación futura
    throw new Error('Not implemented');
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Implementación futura
    throw new Error('Not implemented');
  }
}

export const apiClient = new ApiClient();


