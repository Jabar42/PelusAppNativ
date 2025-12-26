// Preview configuration para Storybook On-Device (React Native)
// Este archivo se usa automáticamente por Storybook React Native

import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui.config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setMockState } from '../storybook/mocks/authStoreMock';

// Decorador global para envolver todas las stories con GluestackUIProvider
export const decorators = [
  (Story: any, context: any) => {
    // Resetear mock de authStore antes de cada story
    const authArgs = context.parameters?.mockAuthState || {};
    setMockState({
      userRole: authArgs.userRole || null,
      isLoading: false,
      hasCompletedOnboarding: authArgs.hasCompletedOnboarding !== undefined ? authArgs.hasCompletedOnboarding : false,
    });

    return (
      <GluestackUIProvider config={config}>
        <SafeAreaProvider>
          <Story />
        </SafeAreaProvider>
      </GluestackUIProvider>
    );
  },
];

// Parámetros globales
export const parameters = {
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#ffffff',
      },
      {
        name: 'dark',
        value: '#1a1a1a',
      },
    ],
  },
};











