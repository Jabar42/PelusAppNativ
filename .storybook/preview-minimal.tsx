// Preview MINIMAL - Usa este archivo temporalmente para verificar que Storybook funciona
// Si esto funciona, el problema está en GluestackUIProvider o SafeAreaProvider
import type { Preview } from '@storybook/react-native';
import { View } from 'react-native';

const preview: Preview = {
  decorators: [
    (Story: any) => {
      // Decorador mínimo sin providers
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
          <Story />
        </View>
      );
    },
  ],
  parameters: {},
};

export default preview;





