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
    <Center flex={1} backgroundColor="$backgroundLight200" padding="$4">
      <Box 
        width={375} 
        height={667} 
        backgroundColor="$white" 
        sx={{
          _ios: {
            shadowColor: "$black",
            shadowOpacity: 0.2,
            shadowRadius: 20,
          },
          _android: {
            elevation: 10,
          },
          _web: {
            boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
          }
        }}
        borderRadius="$3xl"
        overflow="hidden"
        borderWidth={8}
        borderColor="$warmGray800"
      >
        <LoadingScreen />
      </Box>
      <Text marginTop="$4" color="$textLight500" fontSize="$sm">
        Vista previa en contenedor tamaño iPhone 8
      </Text>
    </Center>
  ),
};

export const CustomBackground: Story = {
  render: () => (
    <VStack gap="$4" flex={1}>
      <Box flex={1} backgroundColor="$primary900">
        <LoadingScreen />
      </Box>
      <Box flex={1} backgroundColor="$success700">
        <LoadingScreen />
      </Box>
    </VStack>
  ),
};
