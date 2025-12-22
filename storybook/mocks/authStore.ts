import { UserRole } from '@/core/types/user';

/**
 * Mock factory para useAuthStore de Zustand
 * Permite establecer el estado del store para cada story
 */
export interface MockAuthState {
  userRole: UserRole | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

let mockAuthState: MockAuthState = {
  userRole: null,
  isLoading: false,
  hasCompletedOnboarding: false,
};

/**
 * Establece el estado mock del authStore
 */
export const setMockAuthState = (state: Partial<MockAuthState>) => {
  mockAuthState = { ...mockAuthState, ...state };
};

/**
 * Obtiene el estado mock actual
 */
export const getMockAuthState = (): MockAuthState => {
  return { ...mockAuthState };
};

/**
 * Resetea el estado mock a los valores por defecto
 */
export const resetMockAuthState = () => {
  mockAuthState = {
    userRole: null,
    isLoading: false,
    hasCompletedOnboarding: false,
  };
};

/**
 * Crea un mock del hook useAuthStore
 * Para usar en stories que necesiten controlar el estado de autenticación
 */
export const createMockUseAuthStore = (initialState?: Partial<MockAuthState>) => {
  if (initialState) {
    setMockAuthState(initialState);
  }
  
  return () => ({
    ...mockAuthState,
    setUserRole: (role: UserRole | null) => setMockAuthState({ userRole: role }),
    setIsLoading: (loading: boolean) => setMockAuthState({ isLoading: loading }),
    setHasCompletedOnboarding: (value: boolean) => 
      setMockAuthState({ hasCompletedOnboarding: value }),
    clearAuth: () => resetMockAuthState(),
  });
};









