import { ExpoConfig, ConfigContext } from 'expo/config';

// Brand name - debe coincidir con src/core/config/brand.ts
// Nota: No podemos importar desde otros archivos TypeScript aquí porque
// Expo ejecuta este archivo directamente con Node.js sin transpilación
const BRAND_NAME = "Vetifly";

// Generamos un slug válido (minúsculas y guiones) basado en el nombre
const slug = BRAND_NAME.toLowerCase().replace(/\s+/g, '-');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: BRAND_NAME,
  slug: `${slug}-native`,
  version: "1.0.0",
  scheme: slug,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: ["**/*"],
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission: "La app necesita acceso a tus fotos para agregar imágenes de mascotas.",
        cameraPermission: "La app necesita acceso a la cámara para tomar fotos de mascotas."
      }
    ]
  ],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSPhotoLibraryUsageDescription: "La app necesita acceso a tus fotos para agregar imágenes de mascotas.",
      NSCameraUsageDescription: "La app necesita acceso a la cámara para tomar fotos de mascotas."
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
    name: BRAND_NAME,
    shortName: BRAND_NAME,
    display: "standalone",
    startUrl: "/",
    backgroundColor: "#ffffff",
    themeColor: "#ffffff"
  }
});

