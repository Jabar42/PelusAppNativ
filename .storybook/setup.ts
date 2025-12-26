/**
 * Setup file para Storybook
 * Se ejecuta antes de todas las stories
 */

import { setMockAuthState, getMockAuthState } from '../storybook/mocks/authStore';

// Mock del módulo authStore
// Esto se ejecutará antes de que cualquier componente importe useAuthStore
if (typeof window !== 'undefined') {
  // En el navegador, podemos usar módulos dinámicos
  // El mock real se manejará a través del decorator en preview.tsx
  (window as any).__STORYBOOK_MOCK_AUTH_STATE__ = {
    get: getMockAuthState,
    set: setMockAuthState,
  };
}

// Exportar para uso en stories si es necesario
export { setMockAuthState, getMockAuthState };















