// Preview simplificado SIN Gluestack UI para prueba de humos
// Este archivo verifica que Storybook se mantiene vivo sin dependencias complejas

import 'regenerator-runtime/runtime';
import React from 'react';
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
    (Story) => {
      // Decorador mínimo sin Gluestack UI
      return (
        <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#ffffff' }}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;





