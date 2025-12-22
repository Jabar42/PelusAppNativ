// Preview configuration para Storybook Web
// Configurado para usar versiones web de todas las librerías

import 'regenerator-runtime/runtime';
import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui.config';
// SafeAreaProvider funciona en web a través de react-native-web
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setMockState } from '../storybook/mocks/authStoreMock';
import type { Preview } from '@storybook/react';

// Definir __DEV__ para React Native (usado por algunas librerías)
if (typeof window !== 'undefined' && typeof (window as any).__DEV__ === 'undefined') {
  (window as any).__DEV__ = process.env.NODE_ENV !== 'production';
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
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
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Resetear mock de authStore antes de cada story
      try {
        const authArgs = context.parameters?.mockAuthState || {};
        if (typeof setMockState !== 'undefined' && setMockState) {
          setMockState({
            userRole: authArgs.userRole || null,
            isLoading: false,
            hasCompletedOnboarding: authArgs.hasCompletedOnboarding !== undefined ? authArgs.hasCompletedOnboarding : false,
          });
        }
      } catch (e) {
        // Ignorar errores del mock
      }

      // Envolver con GluestackUIProvider (versión web)
      return (
        <GluestackUIProvider config={config}>
          <SafeAreaProvider>
            <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#ffffff' }}>
              <Story />
            </div>
          </SafeAreaProvider>
        </GluestackUIProvider>
      );
    },
  ],
};

export default preview;
