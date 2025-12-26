import { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { VStack, HStack, Text, Button } from '@gluestack-ui/themed';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Título de la tarjeta',
    subtitle: 'Esta es una descripción de la tarjeta',
    children: <Text>Contenido de la tarjeta</Text>,
  },
};

export const Simple: Story = {
  args: {
    children: <Text>Tarjeta simple sin título</Text>,
  },
};

export const WithContent: Story = {
  args: {
    title: 'Producto destacado',
    subtitle: 'Descripción del producto',
    children: (
      <VStack space="md">
        <Text>Precio: $99.99</Text>
        <Button size="sm">Agregar al carrito</Button>
      </VStack>
    ),
  },
};

export const WithoutShadow: Story = {
  args: {
    title: 'Tarjeta sin sombra',
    subtitle: 'Esta tarjeta no tiene sombra',
    hasShadow: false,
    children: <Text>Contenido</Text>,
  },
};

export const Pressable: Story = {
  args: {
    title: 'Tarjeta clickeable',
    subtitle: 'Haz click para ver más',
    isPressable: true,
    onPress: () => alert('Tarjeta presionada'),
    children: <Text>Contenido interactivo</Text>,
  },
};

export const PaddingVariants: Story = {
  render: () => (
    <VStack space="md" width="100%">
      <Card title="Padding pequeño" padding="xs">
        <Text>Contenido con padding extra pequeño</Text>
      </Card>
      <Card title="Padding mediano" padding="md">
        <Text>Contenido con padding mediano (default)</Text>
      </Card>
      <Card title="Padding grande" padding="xl">
        <Text>Contenido con padding extra grande</Text>
      </Card>
    </VStack>
  ),
};

export const ComplexLayout: Story = {
  args: {
    title: 'Dashboard Card',
    subtitle: 'Resumen de estadísticas',
    children: (
      <VStack space="md">
        <HStack justifyContent="space-between">
          <VStack>
            <Text size="xs" color="$textLight500">Ventas</Text>
            <Text size="lg" fontWeight="$bold">$12,345</Text>
          </VStack>
          <VStack>
            <Text size="xs" color="$textLight500">Usuarios</Text>
            <Text size="lg" fontWeight="$bold">1,234</Text>
          </VStack>
        </HStack>
      </VStack>
    ),
  },
};

















