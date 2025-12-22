import { create } from 'zustand';
import { UserRole } from '@/core/types/user';

/**
 * Mock del store de Zustand para usar en Storybook
 * Este archivo reemplaza el authStore real en Storybook
 */

export interface AuthState {
  userRole: UserRole | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setUserRole: (role: UserRole | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  clearAuth: () => void;
}

console.log('🏗️ Inicializando Mock Auth Store (INSTANCIA ÚNICA)');

// Creamos un store real de Zustand para que los componentes reaccionen a los cambios
export const useAuthStore = create<AuthState>((set) => ({
  userRole: null,
  isLoading: false, // Por defecto en false para Storybook
  hasCompletedOnboarding: false,
  setUserRole: (role) => {
    console.log('🔑 Mock: setUserRole ->', role);
    set({ userRole: role });
  },
  setIsLoading: (loading) => {
    console.log('⏳ Mock: setIsLoading ->', loading);
    set({ isLoading: loading });
  },
  setHasCompletedOnboarding: (value) => {
    console.log('✅ Mock: setHasCompletedOnboarding ->', value);
    set({ hasCompletedOnboarding: value });
  },
  clearAuth: () => {
    console.log('🧹 Mock: clearAuth');
    set({ userRole: null, isLoading: false, hasCompletedOnboarding: false });
  },
}));

// Proxy para debuguear cuándo se usa el hook
const originalUseAuthStore = useAuthStore;
(useAuthStore as any).debug = true;

// Función para actualizar el estado desde los decoradores de Storybook
export const setMockState = (state: Partial<Pick<AuthState, 'userRole' | 'isLoading' | 'hasCompletedOnboarding'>>) => {
  console.log('🛠️ setMockState ejecutado con:', JSON.stringify(state));
  originalUseAuthStore.setState(state);
};



