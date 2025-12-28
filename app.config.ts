import { BRAND_NAME } from './src/core/config/brand.ts';
import { ExpoConfig, ConfigContext } from 'expo/config';

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
  plugins: ["expo-router", "expo-secure-store"],
  ios: {
    supportsTablet: true
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

