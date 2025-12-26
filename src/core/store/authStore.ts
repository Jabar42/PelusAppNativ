import { create } from 'zustand';

export interface AuthState {
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true, // Inicialmente en true para evitar flickering
  hasCompletedOnboarding: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  setHasCompletedOnboarding: (value) =>
    set({ hasCompletedOnboarding: value }),
  clearAuth: () =>
    set({
      isLoading: true,
      hasCompletedOnboarding: false,
    }),
}));
