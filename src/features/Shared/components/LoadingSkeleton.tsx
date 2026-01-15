import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Box } from '@gluestack-ui/themed';

type BoxProps = React.ComponentProps<typeof Box>;

interface LoadingSkeletonProps {
  width?: BoxProps['width'];
  height?: BoxProps['height'];
  borderRadius?: BoxProps['borderRadius'];
  marginBottom?: BoxProps['marginBottom'];
}

export function LoadingSkeleton({
  width = '$full',
  height = '$4',
  borderRadius = '$md',
  marginBottom = '$0',
}: LoadingSkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Box
        width={width}
        height={height}
        borderRadius={borderRadius}
        backgroundColor="$backgroundLight200"
        marginBottom={marginBottom}
      />
    </Animated.View>
  );
}

interface LoadingSkeletonCardProps {
  lines?: number;
}

export function LoadingSkeletonCard({ lines = 3 }: LoadingSkeletonCardProps) {
  return (
    <Box
      padding="$4"
      borderRadius="$lg"
      backgroundColor="$white"
      borderWidth="$1"
      borderColor="$borderLight200"
      gap="$3"
    >
      <LoadingSkeleton width="$3/4" height="$5" />
      {Array.from({ length: lines }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          width={index === lines - 1 ? '$1/2' : '$full'}
          height="$4"
        />
      ))}
    </Box>
  );
}
