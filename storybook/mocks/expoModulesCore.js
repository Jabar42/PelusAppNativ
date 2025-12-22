/**
 * Mock para expo-modules-core
 * Intercepta requireNativeModule para retornar mocks de módulos nativos
 * 
 * expo-font/build/ExpoFontLoader.js hace:
 * import { requireNativeModule } from 'expo-modules-core';
 * export default requireNativeModule('ExpoFontLoader');
 */

// Mock de ExpoFontLoader
const ExpoFontLoader = {
  loadAsync: async (fontFamily, source) => {
    // En web, las fuentes se cargan automáticamente vía CSS
    return Promise.resolve();
  },
  unloadAsync: async (fontFamily) => {
    return Promise.resolve();
  },
  isLoaded: (fontFamily) => {
    return true;
  },
};

// Mock de requireNativeModule - debe ser named export
export function requireNativeModule(moduleName) {
  // Retornar mocks específicos según el nombre del módulo
  if (moduleName === 'ExpoFontLoader') {
    return ExpoFontLoader;
  }
  
  // Para otros módulos nativos, retornar un objeto mock genérico
  return {
    // Propiedades comunes de módulos nativos
    __nativeModule: true,
    moduleName,
  };
}

// Mock de requireOptionalNativeModule (usado por expo-asset y expo-constants)
export function requireOptionalNativeModule(moduleName) {
  // Similar a requireNativeModule pero nunca lanza error, retorna null si no existe
  if (moduleName === 'ExpoFontLoader') {
    return ExpoFontLoader;
  }
  
  // Retornar null para módulos opcionales que no existen
  return null;
}

// Solo exportar requireNativeModule y requireOptionalNativeModule
// No exportar otras funciones para evitar conflictos con otros módulos de expo-modules-core
// También exportar como default para compatibilidad
export default {
  requireNativeModule,
  requireOptionalNativeModule,
};









