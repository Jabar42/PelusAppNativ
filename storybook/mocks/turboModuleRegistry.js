/**
 * Mock específico para TurboModuleRegistry
 * Este archivo reemplaza react-native/Libraries/TurboModule/TurboModuleRegistry
 * 
 * TurboModuleRegistry es usado por react-native-svg y otros módulos nativos
 * En web, estos módulos no existen, así que proporcionamos mocks completos
 */

// Cache de módulos mock para evitar recrearlos
const moduleCache = new Map();

// Crear un mock más completo de TurboModule
function createTurboModuleMock(name) {
  if (moduleCache.has(name)) {
    return moduleCache.get(name);
  }

  const mock = {
    __turboModuleProxy: true,
    __moduleName: name,
    // Métodos comunes que podrían ser llamados
    // Estos son no-ops en web ya que no hay implementación nativa
    addListener: () => {},
    removeListeners: () => {},
    removeAllListeners: () => {},
    // Propiedades comunes
    constants: {},
  };

  moduleCache.set(name, mock);
  return mock;
}

export const TurboModuleRegistry = {
  get: (name) => {
    if (!name) {
      return null;
    }
    
    // Retornar un mock completo del módulo
    return createTurboModuleMock(name);
  },
  
  getEnforcing: (name) => {
    // Similar a get pero nunca retorna null
    // Si name es undefined/null, retornamos un mock genérico
    const moduleName = name || 'UnknownTurboModule';
    return createTurboModuleMock(moduleName);
  },
  
  // Métodos adicionales que podrían existir
  has: (name) => {
    // En web, siempre retornamos false ya que no hay módulos nativos reales
    return false;
  },
};

// También exportar como default para compatibilidad
export default TurboModuleRegistry;














