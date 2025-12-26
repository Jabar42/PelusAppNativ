import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { VStack, HStack, Box, Text, Center, Heading } from '@gluestack-ui/themed';
import React from 'react';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'link', 'ghost'],
    },
    colorScheme: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning'],
    },
    isDisabled: {
      control: 'boolean',
    },
    isLoading: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'solid',
    size: 'md',
    colorScheme: 'primary',
  },
};

export const AllVariants: Story = {
  render: () => (
    <VStack space="xl">
      <Box>
        <Heading size="sm" mb="$2">Solid (Default)</Heading>
        <HStack space="md">
          <Button variant="solid" colorScheme="primary">Primary</Button>
          <Button variant="solid" colorScheme="secondary">Secondary</Button>
          <Button variant="solid" colorScheme="success">Success</Button>
          <Button variant="solid" colorScheme="error">Error</Button>
        </HStack>
      </Box>

      <Box>
        <Heading size="sm" mb="$2">Outline</Heading>
        <HStack space="md">
          <Button variant="outline" colorScheme="primary">Primary</Button>
          <Button variant="outline" colorScheme="secondary">Secondary</Button>
          <Button variant="outline" colorScheme="success">Success</Button>
          <Button variant="outline" colorScheme="error">Error</Button>
        </HStack>
      </Box>

      <Box>
        <Heading size="sm" mb="$2">Ghost & Link</Heading>
        <HStack space="md">
          <Button variant="ghost" colorScheme="primary">Ghost</Button>
          <Button variant="link" colorScheme="primary">Link</Button>
        </HStack>
      </Box>
    </VStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack space="md" alignItems="center">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </HStack>
  ),
};

export const States: Story = {
  render: () => (
    <VStack space="md">
      <HStack space="md">
        <Button isDisabled>Disabled</Button>
        <Button variant="outline" isDisabled>Disabled Outline</Button>
      </HStack>
      <HStack space="md">
        <Button isLoading>Loading</Button>
        <Button variant="outline" isLoading>Loading Outline</Button>
      </HStack>
    </VStack>
  ),
};

// Historia para probar si el wrapper actual soporta iconos o si necesita refactor
export const WithIcons: Story = {
  render: () => {
    // Uso de un emoji como prueba simple de "icono" ya que no queremos 
    // depender de que las fuentes de iconos carguen perfectamente en esta fase
    return (
      <VStack space="md">
        <Button>
          🚀 Lanzar App
        </Button>
        <Button variant="outline" colorScheme="success">
          ✅ Confirmar
        </Button>
        <Button variant="ghost" colorScheme="error">
          🗑️ Eliminar
        </Button>
      </VStack>
    );
  },
};








