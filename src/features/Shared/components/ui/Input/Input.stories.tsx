import { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { VStack } from '@gluestack-ui/themed';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Ingresa tu texto aquí',
    value: '',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'Email',
    value: 'usuario@ejemplo.com',
    type: 'email',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Campo deshabilitado',
    value: 'No se puede editar',
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    placeholder: 'Email',
    value: 'email-invalido',
    isInvalid: true,
    type: 'email',
  },
};

export const Password: Story = {
  args: {
    placeholder: 'Contraseña',
    type: 'password',
    value: '',
  },
};

export const Sizes: Story = {
  render: () => (
    <VStack space="md" width="100%">
      <Input placeholder="Extra pequeño" size="xs" />
      <Input placeholder="Pequeño" size="sm" />
      <Input placeholder="Mediano (default)" size="md" />
      <Input placeholder="Grande" size="lg" />
      <Input placeholder="Extra grande" size="xl" />
    </VStack>
  ),
};









