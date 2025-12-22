/**
 * Mock para módulos nativos de React Native que no existen en web
 * Estos módulos se usan en mobile pero no son necesarios en Storybook web
 */

// Mock de codegenNativeComponent (debe ser default export para algunos imports)
const codegenNativeComponent = (componentName, options) => {
  // Retornar un componente funcional que no hace nada
  return function MockedNativeComponent(props) {
    return null;
  };
};

// Exportar funciones mock comunes
export const NativeSafeAreaProvider = () => null;
export const NativeSafeAreaView = () => null;
export const AndroidSvgViewNativeComponent = () => null;

// Mock de TurboModuleRegistry para react-native-svg y react-native
// Debe ser compatible con la API de TurboModuleRegistry
export const TurboModuleRegistry = {
  get: (name) => {
    // Retornar un objeto mock que tenga las propiedades básicas
    return name ? {
      // Propiedades comunes de TurboModules
      __turboModuleProxy: true,
    } : null;
  },
  getEnforcing: (name) => {
    // Similar a get pero nunca retorna null
    return {
      __turboModuleProxy: true,
    };
  },
};

// Mock de RCTExport
export const RCTExport = () => null;

// Mock de ExpoFontLoader para expo-font
export const ExpoFontLoader = {
  loadAsync: async (fontFamily, source) => {
    // En web, las fuentes se cargan automáticamente, solo retornar éxito
    return Promise.resolve();
  },
  unloadAsync: async (fontFamily) => {
    return Promise.resolve();
  },
  isLoaded: (fontFamily) => {
    // Simular que las fuentes están cargadas
    return true;
  },
};

// Exportar codegenNativeComponent como named export
export { codegenNativeComponent };

// Exportar como default para compatibilidad con imports default
export default codegenNativeComponent;











