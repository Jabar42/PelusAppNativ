import React, { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  withDelay,
  FadeIn
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Box, Text, useToken, Center, VStack, Button, ButtonText, HStack, Icon } from '@gluestack-ui/themed';

export default function LoadingScreen() {
  const brandColor = useToken('colors', 'primary600' as any);
  const primaryBg = useToken('colors', 'primary0' as any);
  const gray200 = useToken('colors', 'gray200' as any);
  const gray500 = useToken('colors', 'gray500' as any);
  const gray800 = useToken('colors', 'gray800' as any);
  const gray100 = useToken('colors', 'gray100' as any);

  const [showRetry, setShowRetry] = useState(false);

  const scale = useSharedValue(1);
  const ring1Scale = useSharedValue(0.5);
  const ring1Opacity = useSharedValue(1);
  const ring2Scale = useSharedValue(0.5);
  const ring2Opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const textOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Failsafe: Si tarda más de 15 segundos, mostrar botón de reintento
    const timer = setTimeout(() => {
      setShowRetry(true);
    }, 15000);

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

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    if (Platform.OS === 'web') {
      // Limpiar banderas de sesión para permitir nuevo intento automático si falla
      sessionStorage.removeItem('appErrorReloaded');
      // Recarga forzada
      window.location.reload();
    }
  };

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

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Center flex={1} backgroundColor="$primary0">
      <Box width={"$48" as any} height={"$48" as any} justifyContent="center" alignItems="center">
        {/* Ripples */}
        <Animated.View style={[{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: brandColor,
        }, ring1Style]} />
        <Animated.View style={[{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 2,
          borderColor: brandColor,
        }, ring2Style]} />
        
        {/* Outer Accent Ring (Dashed) */}
        <Animated.View style={[{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: 65,
          borderWidth: 1,
          borderColor: gray200,
          borderStyle: 'dashed',
        }, accentStyle]} />

        {/* Inner Circle and Icon */}
        <Animated.View style={[{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: gray100,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          // Sombras nativas
          shadowColor: brandColor,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
        }, iconStyle]}>
          <Ionicons name="paw" size={42} color={brandColor} />
        </Animated.View>
      </Box>
      
      <VStack marginTop="$10" alignItems="center" space="md">
        <VStack alignItems="center">
          <Animated.View style={textAnimatedStyle}>
            <Text 
              fontSize="$2xl" 
              fontWeight="$extrabold" 
              color="$gray800" 
              sx={{
                _web: {
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }
              }}
            >
              Pelus
            </Text>
          </Animated.View>
          <Animated.View style={textAnimatedStyle}>
            <Text 
              fontSize="$sm" 
              color="$gray500" 
              marginTop="$2"
              fontWeight="$medium"
            >
              {showRetry ? 'La conexión está tardando más de lo esperado' : 'Cargando experiencias...'}
            </Text>
          </Animated.View>
        </VStack>

        {showRetry && Platform.OS === 'web' && (
          <Animated.View entering={FadeIn.duration(500)}>
            <Button 
              size="md" 
              variant="outline" 
              action="primary" 
              onPress={handleRetry}
              borderColor="$primary600"
              sx={{
                ':hover': {
                  backgroundColor: '$primary50',
                }
              }}
            >
              <HStack space="xs" alignItems="center">
                <Icon as={Ionicons} name="refresh" color="$primary600" />
                <ButtonText color="$primary600">Reintentar conexión</ButtonText>
              </HStack>
            </Button>
          </Animated.View>
        )}
      </VStack>
    </Center>
  );
}
