// Preview DEBUG - Versión mínima para verificar que Storybook funciona
import React from 'react';
import type { Preview } from '@storybook/react';
import { View } from 'react-native';

const preview: Preview = {
  decorators: [
    (Story: any) => {
      // Decorador mínimo sin providers
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Story />
        </View>
      );
    },
  ],
  parameters: {},
};

export default preview;









