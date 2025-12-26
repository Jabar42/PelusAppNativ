/**
 * Mock para los módulos de fabric de react-native-svg
 * Estos módulos intentan usar TurboModuleRegistry que no existe en web
 * Este mock intercepta esos módulos y proporciona implementaciones web-compatibles
 * 
 * Los módulos originales hacen:
 * import { TurboModuleRegistry } from 'react-native';
 * export default TurboModuleRegistry.get('NativeSvgRenderableModule');
 * 
 * En web, estos módulos no son necesarios porque react-native-svg usa su propia
 * implementación web. Este mock simplemente exporta objetos vacíos para evitar errores.
 */

// En web, react-native-svg no necesita estos módulos nativos
// Simplemente exportamos objetos mock que satisfacen las importaciones

// Mock para NativeSvgRenderableModule
// El módulo original intenta: export default TurboModuleRegistry.get('NativeSvgRenderableModule');
const NativeSvgRenderableModule = {
  __turboModuleProxy: true,
  __moduleName: 'NativeSvgRenderableModule',
  // Métodos que podrían ser llamados (no-ops en web)
  createNode: () => {},
  createRenderer: () => {},
  releaseNode: () => {},
  addListener: () => {},
  removeListeners: () => {},
};

// Mock para NativeSvgViewModule
// El módulo original intenta: export default TurboModuleRegistry.get('NativeSvgViewModule');
const NativeSvgViewModule = {
  __turboModuleProxy: true,
  __moduleName: 'NativeSvgViewModule',
  // Métodos que podrían ser llamados (no-ops en web)
  createView: () => {},
  releaseView: () => {},
  addListener: () => {},
  removeListeners: () => {},
};

// Exportar como default (como lo hace el módulo original)
export default NativeSvgRenderableModule;

// También exportar ambos como named exports para compatibilidad
export { NativeSvgRenderableModule, NativeSvgViewModule };














