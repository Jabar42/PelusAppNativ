import { create } from 'zustand';
import { UserRole } from '../types/user';

interface AuthState {
  userRole: UserRole | null;
  isLoading: boolean;
  setUserRole: (role: UserRole | null) => void;
  setIsLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userRole: null,
  isLoading: true, // Inicialmente en true para evitar flickering
  setUserRole: (role) => set({ userRole: role }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  clearAuth: () => set({ userRole: null, isLoading: true }),
}));

