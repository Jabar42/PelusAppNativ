import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  interpolate,
  withDelay
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const scale = useSharedValue(1);
  const ring1Scale = useSharedValue(0.5);
  const ring1Opacity = useSharedValue(1);
  const ring2Scale = useSharedValue(0.5);
  const ring2Opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const textOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Icon pulsing
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(1, { duration: 1000, easing: Easing.bezier(0.4, 0, 0.2, 1) })
      ),
      -1,
      true
    );

    // Ripple effect 1
    ring1Scale.value = withRepeat(
      withTiming(2, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );

    // Ripple effect 2 (delayed)
    ring2Scale.value = withDelay(
      1000,
      withRepeat(
        withTiming(2, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
    ring2Opacity.value = withDelay(
      1000,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );

    // Continuous rotation for a small accent
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Text breathing
    textOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.4, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const accentStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {/* Ripples */}
        <Animated.View style={[styles.ring, ring1Style]} />
        <Animated.View style={[styles.ring, ring2Style]} />
        
        {/* Outer Accent Ring (Dashed) */}
        <Animated.View style={[styles.accentRing, accentStyle]} />

        {/* Inner Circle and Icon */}
        <Animated.View style={[styles.mainCircle, iconStyle]}>
          <Ionicons name="paw" size={42} color="#4F46E5" />
        </Animated.View>
      </View>
      
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.text, textStyle]}>
          Pelus
        </Animated.Text>
        <Animated.Text style={[styles.subtext, textStyle]}>
          Cargando experiencias...
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  accentRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
});
