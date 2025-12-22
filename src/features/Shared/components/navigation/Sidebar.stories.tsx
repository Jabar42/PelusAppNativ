import { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';
import { Box, Text } from '@gluestack-ui/themed';

const meta: Meta<typeof Sidebar> = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sidebar de navegación para desktop. Muestra todas las rutas disponibles según el rol del usuario.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: false,
      description: 'Estado de navegación de React Navigation',
    },
    descriptors: {
      control: false,
      description: 'Descriptores de las rutas',
    },
    navigation: {
      control: false,
      description: 'Objeto de navegación',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Mock state para diferentes escenarios
const createMockState = (activeRoute: string, routes: string[] = ['index', 'fav', 'pro', 'settings', 'help']) => ({
  index: routes.indexOf(activeRoute),
  routes: routes.map((name) => ({ key: name, name })),
});

const createMockDescriptors = (routes: string[]) => {
  const descriptors: any = {};
  routes.forEach((name) => {
    descriptors[name] = {
      options: {
        title: name.charAt(0).toUpperCase() + name.slice(1),
      },
    };
  });
  return descriptors;
};

const createMockNavigation = () => ({
  navigate: () => {},
  emit: () => ({ defaultPrevented: false }),
});

export const B2BUser: Story = {
  render: () => {
    const state = createMockState('index', ['index', 'pro', 'settings', 'help']);
    const descriptors = createMockDescriptors(['index', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box width={1440} height={900} flexDirection="row">
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box flex={1} padding={20}>
          <Text>Contenido principal</Text>
        </Box>
      </Box>
    );
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2B',
      isLoading: false,
    },
  },
};

export const B2CUser: Story = {
  render: () => {
    const state = createMockState('fav', ['index', 'fav', 'pro', 'settings', 'help']);
    const descriptors = createMockDescriptors(['index', 'fav', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box width={1440} height={900} flexDirection="row">
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box flex={1} padding={20}>
          <Text>Contenido principal</Text>
        </Box>
      </Box>
    );
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2C',
      isLoading: false,
    },
  },
};

export const ActiveHome: Story = {
  render: () => {
    const state = createMockState('index');
    const descriptors = createMockDescriptors(['index', 'fav', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box width={1440} height={900} flexDirection="row">
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box flex={1} padding={20}>
          <Text>Home activo</Text>
        </Box>
      </Box>
    );
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2C',
      isLoading: false,
    },
  },
};

export const ActiveSettings: Story = {
  render: () => {
    const state = createMockState('settings');
    const descriptors = createMockDescriptors(['index', 'fav', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box width={1440} height={900} flexDirection="row">
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box flex={1} padding={20}>
          <Text>Configuración activa</Text>
        </Box>
      </Box>
    );
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2B',
      isLoading: false,
    },
  },
};














