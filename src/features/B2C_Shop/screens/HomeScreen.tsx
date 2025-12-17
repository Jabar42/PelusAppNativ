import React from 'react';
import { Box, Text, VStack, Center } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import InstallPWAButton from '@/shared/components/InstallPWAButton';

export function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, width: '100%', overflow: 'hidden' }} edges={['top']}>
      <Box flex={1} className="w-full bg-gray-100 dark:bg-gray-900 items-center justify-center pb-14">
        <Center>
          <VStack space="md" alignItems="center">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              TIENDA B2C
            </Text>
            <Text className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Bienvenido a la Tienda
            </Text>
            <InstallPWAButton />
          </VStack>
        </Center>
      </Box>
    </SafeAreaView>
  );
}

