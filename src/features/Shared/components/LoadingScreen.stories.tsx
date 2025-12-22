import { Meta, StoryObj } from '@storybook/react';
import LoadingScreen from './LoadingScreen';
import { Box, Center, Text, VStack } from '@gluestack-ui/themed';
import React from 'react';

const meta: Meta<typeof LoadingScreen> = {
  title: 'Shared/LoadingScreen',
  component: LoadingScreen,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingScreen>;

export const Default: Story = {};

export const InsideMobileFrame: Story = {
  render: () => (
    <Center fill backgroundColor="$backgroundLight200" p="$4">
      <Box 
        w={375} 
        h={667} 
        backgroundColor="$white" 
        shadowColor="$black" 
        shadowOpacity={0.2} 
        shadowRadius={20}
        borderRadius="$3xl"
        overflow="hidden"
        borderWidth={8}
        borderColor="$warmGray800"
      >
        <LoadingScreen />
      </Box>
      <Text mt="$4" color="$textLight500" size="sm">
        Vista previa en contenedor tamaño iPhone 8
      </Text>
    </Center>
  ),
};

export const CustomBackground: Story = {
  render: () => (
    <VStack space="md" fill>
      <Box flex={1} backgroundColor="$primary900">
        <LoadingScreen />
      </Box>
      <Box flex={1} backgroundColor="$success700">
        <LoadingScreen />
      </Box>
    </VStack>
  ),
};


