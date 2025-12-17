import { Slot } from 'expo-router';
import { Box } from '@gluestack-ui/themed';

export default function InitialLayout() {
  return (
    <Box flex={1} className="bg-white dark:bg-black">
      <Slot />
    </Box>
  );
}


