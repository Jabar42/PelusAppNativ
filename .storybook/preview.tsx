import 'regenerator-runtime/runtime';
import React from 'react';
import { AppRegistry } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../gluestack-ui.config';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setMockState } from '../storybook/mocks/authStoreMock';
import type { Preview } from '@storybook/react';

// Registro de App para React Native Web
AppRegistry.registerComponent('Storybook', () => () => null);
const { getStyleElement } = AppRegistry.getApplication('Storybook');

// Inyectar estilos base de RNW y Gluestack
if (typeof window !== 'undefined') {
  try {
    const styleElement = getStyleElement();
    document.head.insertAdjacentHTML('beforeend', styleElement.props.dangerouslySetInnerHTML.__html);
  } catch (e) {
    console.warn('No se pudieron inyectar los estilos de AppRegistry', e);
  }
  
  const customStyle = document.createElement('style');
  customStyle.textContent = `
    html, body, #storybook-root {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      overflow: auto !important; /* Permitir scroll si es necesario */
    }
    #storybook-root {
      display: flex;
      flex: 1;
    }
    .loading-fallback {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
      font-family: sans-serif;
      background: #f0f0f0;
      color: #666;
    }
  `;
  document.head.appendChild(customStyle);
}

// Definir __DEV__
if (typeof window !== 'undefined' && typeof (window as any).__DEV__ === 'undefined') {
  (window as any).__DEV__ = true;
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
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      // Log para depuración
      console.log('🎬 Renderizando decorador para:', context.title, context.name);

      // Aplicar estado de Auth Mock si existe en los parámetros
      const authArgs = context.parameters?.mockAuthState || {};
      
      React.useLayoutEffect(() => {
        console.log('🔄 Aplicando mocks de estado (useLayoutEffect)...');
        if (typeof setMockState !== 'undefined') {
          setMockState({
            userRole: authArgs.userRole || null,
            isLoading: authArgs.isLoading ?? false,
            hasCompletedOnboarding: authArgs.hasCompletedOnboarding ?? false,
          });
        }
      }, [JSON.stringify(authArgs)]);

      // Si la historia tiene el parámetro 'noGluestack', renderizamos sin el provider
      if (context.parameters?.noGluestack) {
        console.log('⚡ Renderizando SIN Gluestack (modo aislamiento)');
        return (
          <React.Suspense fallback={<div className="loading-fallback">Cargando preview (HTML)...</div>}>
            <div style={{ padding: '20px' }}>
              <Story />
            </div>
          </React.Suspense>
        );
      }

      console.log('🎨 Renderizando CON Gluestack Provider');
      return (
        <React.Suspense fallback={<div className="loading-fallback">Cargando Gluestack Preview...</div>}>
          <GluestackUIProvider config={config}>
            <SafeAreaProvider>
              <div id="gluestack-story-wrapper" style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh',
                padding: '20px',
                backgroundColor: 'white' // Forzar fondo para evitar transparencias raras
              }}>
                <Story />
              </div>
            </SafeAreaProvider>
          </GluestackUIProvider>
        </React.Suspense>
      );
    },
  ],
};

export default preview;




