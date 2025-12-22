import { Meta, StoryObj } from '@storybook/react';
import RoleGate from './RoleGate';
import { Box, Text, VStack } from '@gluestack-ui/themed';

const meta: Meta<typeof RoleGate> = {
  title: 'Shared/RoleGate',
  component: RoleGate,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente que renderiza contenido solo si el usuario tiene uno de los roles permitidos. Protege rutas y funcionalidades según el rol del usuario.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    allowedRoles: {
      control: 'object',
      description: 'Array de roles permitidos',
    },
    children: {
      control: false,
      description: 'Contenido a renderizar si el usuario tiene el rol permitido',
    },
    fallback: {
      control: false,
      description: 'Contenido a renderizar si el usuario no tiene el rol permitido',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleGate>;

const ProtectedContent = () => (
  <Box p="$4" bg="$blue100" borderRadius="$md">
    <Text>Este contenido solo es visible para usuarios autorizados</Text>
  </Box>
);

const FallbackContent = () => (
  <Box p="$4" bg="$red100" borderRadius="$md">
    <Text>No tienes acceso a este contenido</Text>
  </Box>
);

export const B2BAccess: Story = {
  args: {
    allowedRoles: ['B2B'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2B',
      isLoading: false,
    },
  },
};

export const B2CAccess: Story = {
  args: {
    allowedRoles: ['B2C'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2C',
      isLoading: false,
    },
  },
};

export const MultipleRoles: Story = {
  args: {
    allowedRoles: ['B2B', 'B2C'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2B',
      isLoading: false,
    },
  },
};

export const NoAccess: Story = {
  args: {
    allowedRoles: ['B2B'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: 'B2C',
      isLoading: false,
    },
  },
};

export const LoadingState: Story = {
  args: {
    allowedRoles: ['B2B'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: null,
      isLoading: true,
    },
  },
};

export const NoRole: Story = {
  args: {
    allowedRoles: ['B2B', 'B2C'],
    children: <ProtectedContent />,
    fallback: <FallbackContent />,
  },
  parameters: {
    mockAuthState: {
      userRole: null,
      isLoading: false,
    },
  },
};










