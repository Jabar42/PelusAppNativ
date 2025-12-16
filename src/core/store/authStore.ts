import { create } from 'zustand';
import { UserRole } from '../types/user';

export interface AuthState {
  userRole: UserRole | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  setUserRole: (role: UserRole | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userRole: null,
  isLoading: true, // Inicialmente en true para evitar flickering
  hasCompletedOnboarding: false,
  setUserRole: (role) => set({ userRole: role }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setHasCompletedOnboarding: (value) =>
    set({ hasCompletedOnboarding: value }),
  clearAuth: () =>
    set({
      userRole: null,
      isLoading: true,
      hasCompletedOnboarding: false,
    }),
}));



