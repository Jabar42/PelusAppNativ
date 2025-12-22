import { Meta, StoryObj } from '@storybook/react';
import Sidebar from './Sidebar';
import { Box } from '@gluestack-ui/themed';

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
  navigate: jest.fn(),
  emit: jest.fn(() => ({ defaultPrevented: false })),
});

export const B2BUser: Story = {
  render: () => {
    const state = createMockState('index', ['index', 'pro', 'settings', 'help']);
    const descriptors = createMockDescriptors(['index', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box style={{ width: '1440px', height: '900px', display: 'flex', flexDirection: 'row' }}>
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box style={{ flex: 1, padding: 20 }}>
          <p>Contenido principal</p>
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
      <Box style={{ width: '1440px', height: '900px', display: 'flex', flexDirection: 'row' }}>
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box style={{ flex: 1, padding: 20 }}>
          <p>Contenido principal</p>
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
      <Box style={{ width: '1440px', height: '900px', display: 'flex', flexDirection: 'row' }}>
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box style={{ flex: 1, padding: 20 }}>
          <p>Home activo</p>
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
      <Box style={{ width: '1440px', height: '900px', display: 'flex', flexDirection: 'row' }}>
        <Sidebar state={state} descriptors={descriptors} navigation={navigation} />
        <Box style={{ flex: 1, padding: 20 }}>
          <p>Configuración activa</p>
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












