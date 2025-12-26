/**
 * Mock para ExpoFontLoader (módulo nativo de Expo)
 * Este módulo se usa en mobile pero no existe en web
 */

export const ExpoFontLoader = {
  loadAsync: async (fontFamily, source) => {
    // En web, las fuentes se cargan automáticamente vía CSS
    // Simplemente retornar éxito
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

export default ExpoFontLoader;















