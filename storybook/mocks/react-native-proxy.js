/**
 * Proxy de react-native para Storybook
 * 
 * Este archivo exporta todo de react-native-web y agrega TurboModuleRegistry
 * que no existe en react-native-web pero es requerido por librerías nativas
 * como react-native-svg.
 * 
 * Cuando cualquier librería importa desde 'react-native', webpack entregará
 * este archivo en su lugar, proporcionando compatibilidad completa.
 * 
 * CRÍTICO: NO importar React aquí para evitar romper la exportación global.
 * react-native-web ya maneja React correctamente.
 */

// Importar todo de react-native-web
// CRÍTICO: No importar React aquí - react-native-web ya lo maneja
import * as RNWeb from 'react-native-web';

// Importar nuestro mock de TurboModuleRegistry
import { TurboModuleRegistry } from './turboModuleRegistry.js';

// Re-exportar todo de react-native-web
// Esto incluye todas las exportaciones de react-native-web sin tocar React
export * from 'react-native-web';

// CRÍTICO: Agregar TurboModuleRegistry que no existe en react-native-web
// pero es requerido por librerías nativas como react-native-svg
export { TurboModuleRegistry };

// También exportar como default para compatibilidad
// Algunas librerías podrían esperar un default export
// CRÍTICO: No incluir React en el default export para evitar conflictos
const ReactNativeProxy = {
  ...RNWeb,
  TurboModuleRegistry,
};

export default ReactNativeProxy;














