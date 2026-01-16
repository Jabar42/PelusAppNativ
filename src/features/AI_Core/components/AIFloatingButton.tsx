/**
 * AI Floating Button
 * Botón flotante para abrir el AI Command Bar
 */

import React from 'react';
import { Box, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AIFloatingButtonProps {
  onPress: () => void;
}

export function AIFloatingButton({ onPress }: AIFloatingButtonProps) {
  const primary600 = useToken('colors', 'primary600');
  const iconSize = useToken('space', '7');

  // Animación de pulso sutil
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 90 : 80,
          right: 20,
          zIndex: 1000,
        },
        animatedStyle,
      ]}
    >
      <Pressable onPress={onPress}>
        <Box
          backgroundColor="$primary600"
          width={60}
          height={60}
          borderRadius="$full"
          justifyContent="center"
          alignItems="center"
          shadowColor="$black"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
        >
          <Ionicons name="sparkles" size={iconSize} color="white" />
        </Box>
      </Pressable>
    </Animated.View>
  );
}
