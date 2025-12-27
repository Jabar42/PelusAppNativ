import { createConfig } from '@gluestack-style/react';
import { config as defaultConfig } from '@gluestack-ui/config';

const commonColors = {
  // Escala de grises compartida
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray800: '#1F2937',

  // Otros colores fijos si son necesarios
  blue50: '#eff6ff',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  purple50: '#faf5ff',
  purple200: '#e9d5ff',
  purple500: '#a855f7',
} as const;

// Escala Morada (Tema Personal/Light)
const lightPrimary = {
  primary0: '#ffffff',
  primary50: '#f5f3ff',
  primary100: '#ede9fe',
  primary200: '#ddd6fe',
  primary300: '#c4b5fd',
  primary400: '#a78bfa',
  primary500: '#8b5cf6',
  primary600: '#7c3aed',
  primary700: '#6d28d9',
  primary800: '#5b21b6',
  primary900: '#4c1d95',
  primary950: '#2e1065',
};

// Escala Esmeralda (Tema Profesional)
const professionalPrimary = {
  primary0: '#ffffff',
  primary50: '#ecfdf5',
  primary100: '#d1fae5',
  primary200: '#a7f3d0',
  primary300: '#6ee7b7',
  primary400: '#34d399',
  primary500: '#10b981',
  primary600: '#059669', // El verde esmeralda profesional
  primary700: '#047857',
  primary800: '#065f46',
  primary900: '#064e3b',
  primary950: '#022c22',
};

export const config = createConfig({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    colors: {
      ...defaultConfig.tokens.colors,
      ...commonColors,
      // Los tokens a nivel de raíz actúan como fallback
      ...lightPrimary,
    },
    space: {
      ...defaultConfig.tokens.space,
      'px': '1px',
      '0': 0,
      '0.5': 2,
      '1': 4,
      '1.5': 6,
      '2': 8,
      '2.5': 10,
      '3': 12,
      '3.5': 14,
      '4': 16,
      '5': 20,
      '6': 24,
      '7': 28,
      '8': 32,
      '9': 36,
      '10': 40,
      '12': 48,
      '14': 56,
      '16': 64,
    },
    fontSizes: {
      ...defaultConfig.tokens.fontSizes,
      '2xs': 10,
      'xs': 12,
      'sm': 14,
      'md': 16,
      'lg': 18,
      'xl': 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
  },
  themes: {
    light: {
      colors: lightPrimary,
    },
    professional: {
      colors: professionalPrimary,
    },
  },
} as const);

type Config = typeof config;

declare module '@gluestack-ui/themed' {
  interface ICustomConfig extends Config {}
}

declare module '@gluestack-style/react' {
  interface ICustomConfig extends Config {}
}
