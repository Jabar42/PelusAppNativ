import React from 'react';
import { Box, Text, Spinner, VStack, Center } from '@gluestack-ui/themed';

export default function LoadingScreen() {
  return (
    <Box flex={1} className="bg-gray-100 dark:bg-gray-900">
      <Center flex={1}>
        <VStack space="md" alignItems="center">
          <Spinner size="large" color="$primary500" />
          <Text className="text-gray-600 dark:text-gray-400 text-base mt-4">
            Cargando...
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}

