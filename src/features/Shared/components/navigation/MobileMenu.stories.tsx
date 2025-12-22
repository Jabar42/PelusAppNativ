import { Meta, StoryObj } from '@storybook/react';
import MobileMenu from './MobileMenu';
import { Box, Text } from '@gluestack-ui/themed';

const meta: Meta<typeof MobileMenu> = {
  title: 'Navigation/MobileMenu',
  component: MobileMenu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Menú de navegación móvil que se muestra en la parte inferior de la pantalla. Muestra solo las rutas relevantes según el rol del usuario.',
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
type Story = StoryObj<typeof MobileMenu>;

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
        tabBarAccessibilityLabel: name,
        tabBarTestID: `tab-${name}`,
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
      <Box width={375} height={667} position="relative">
        <Box flex={1} padding={20}>
          <Text>Contenido de la app</Text>
        </Box>
        <MobileMenu state={state} descriptors={descriptors} navigation={navigation} />
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
      <Box width={375} height={667} position="relative">
        <Box flex={1} padding={20}>
          <Text>Contenido de la app</Text>
        </Box>
        <MobileMenu state={state} descriptors={descriptors} navigation={navigation} />
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
      <Box width={375} height={667} position="relative">
        <Box flex={1} padding={20}>
          <Text>Home activo</Text>
        </Box>
        <MobileMenu state={state} descriptors={descriptors} navigation={navigation} />
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

export const ActiveFavorites: Story = {
  render: () => {
    const state = createMockState('fav');
    const descriptors = createMockDescriptors(['index', 'fav', 'pro', 'settings', 'help']);
    const navigation = createMockNavigation();

    return (
      <Box width={375} height={667} position="relative">
        <Box flex={1} padding={20}>
          <Text>Favoritos activo</Text>
        </Box>
        <MobileMenu state={state} descriptors={descriptors} navigation={navigation} />
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








