/**
 * Mock para expo-constants
 * Proporciona valores por defecto para web que no tiene acceso a constantes nativas
 */

// Mock de Constants para web
const Constants = {
  // Informaci?n de la app
  appOwnership: null,
  expoVersion: null,
  installationId: 'storybook-mock-installation-id',
  sessionId: 'storybook-mock-session-id',
  
  // Informaci?n del dispositivo
  deviceName: typeof navigator !== 'undefined' ? navigator.userAgent : 'Storybook',
  deviceYearClass: null,
  deviceId: 'storybook-mock-device-id',
  
  // Informaci?n del sistema
  systemFonts: [],
  systemVersion: typeof navigator !== 'undefined' ? navigator.platform : 'web',
  
  // Informaci?n de la plataforma
  platform: {
    ios: {
      platform: 'ios',
      model: null,
      userInterfaceIdiom: null,
      systemVersion: null,
    },
    android: {
      platform: 'android',
      versionCode: null,
    },
    web: {
      platform: 'web',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Storybook',
    },
  },
  
  // Informaci?n de la app
  appVersion: '1.0.0',
  nativeAppVersion: null,
  nativeBuildVersion: null,
  
  // Informaci?n del manifest
  manifest: {
    id: '@pelus-app-native/storybook',
    name: 'PelusAppNative Storybook',
    slug: 'pelus-app-native',
    version: '1.0.0',
    sdkVersion: '51.0.0',
    platform: ['web'],
  },
  
  // Informaci?n de ejecuci?n
  executionEnvironment: 'storeClient',
  
  // Informaci?n de actualizaciones (Expo Updates)
  updateId: null,
  updateCreatedAt: null,
  updateRuntimeVersion: null,
  updateChannel: 'default',
  
  // Informaci?n de depuraci?n
  isDevice: false,
  isHeadless: false,
  
  // Informaci?n de estado
  statusBarHeight: 0,
};

// Exportar AppOwnership enum (usado por varias librer?as de Expo)
export const AppOwnership = {
  Standalone: 'standalone',
  Expo: 'expo',
  Guest: 'guest',
};

// Exportar ExecutionEnvironment enum (usado por varias librer?as de Expo)
export const ExecutionEnvironment = {
  Bare: 'bare',
  Standalone: 'standalone',
  StoreClient: 'storeClient',
};

// Exportar como default (como lo hace expo-constants)
export default Constants;

// Tambi?n exportar como named export
export { Constants };
