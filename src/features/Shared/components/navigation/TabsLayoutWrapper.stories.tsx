import { Meta, StoryObj } from '@storybook/react';
import TabsLayoutWrapper from './TabsLayoutWrapper';
import { View, Text } from 'react-native';
import { Box } from '@gluestack-ui/themed';

const meta: Meta<typeof TabsLayoutWrapper> = {
  title: 'Navigation/TabsLayoutWrapper',
  component: TabsLayoutWrapper,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    mockAuthState: {
      userRole: 'B2B',
      isLoading: false,
      hasCompletedOnboarding: true,
    },
    docs: {
      description: {
        component: 'Wrapper que adapta la navegación entre móvil (bottom tabs) y desktop (sidebar). Este componente requiere expo-router y no se puede renderizar completamente en Storybook sin mocks complejos.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabsLayoutWrapper>;

// Nota: TabsLayoutWrapper requiere expo-router que no está disponible en Storybook
// Este componente muestra la estructura pero no funcionará completamente sin mocks complejos
export const Info: Story = {
  render: () => (
    <Box padding="$4">
      <Text style={{ fontSize: 16, marginBottom: 16 }}>
        ⚠️ TabsLayoutWrapper requiere expo-router y no se puede renderizar completamente en Storybook.
      </Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
        Este componente adapta la navegación entre móvil (bottom tabs) y desktop (sidebar).
        Para ver su funcionamiento completo, ejecuta la aplicación.
      </Text>
    </Box>
  ),
};














