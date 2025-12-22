import React from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { VStack, Heading, Text, Box, HStack, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setPendingRole } = useOnboardingStore();

  const blue500 = useToken('colors', 'blue500' as any);
  const purple500 = useToken('colors', 'purple500' as any);
  const gray400 = useToken('colors', 'gray400' as any);

  const handleSelect = (role: 'B2B' | 'B2C') => {
    setPendingRole(role);
    if (role === 'B2B') {
      router.push('/(initial)/(onboarding)/b2b');
    } else {
      router.push('/(initial)/(onboarding)/b2c');
    }
  };

  const roleOptions = [
    {
      role: 'B2B' as const,
      title: 'Soy veterinario',
      subtitle: 'Gestiona tu clínica, pacientes y recordatorios.',
      icon: 'medkit-outline' as keyof typeof Ionicons.glyphMap,
      bgColor: '$blue50',
      borderColor: '$blue200',
      iconColor: '$blue500',
      resolvedIconColor: blue500,
    },
    {
      role: 'B2C' as const,
      title: 'Soy dueño de mascotas',
      subtitle: 'Controla vacunas, citas y bienestar de tus peludos.',
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      bgColor: '$purple50',
      borderColor: '$purple200',
      iconColor: '$purple500',
      resolvedIconColor: purple500,
    },
  ];

  return (
    <Box flex={1} backgroundColor="$white">
      <VStack
        flex={1}
        px="$6"
        py="$12"
        justifyContent="center"
        gap="$6"
      >
        <VStack gap="$3" alignItems="center" mb="$8">
          <Heading textAlign="center" color="$gray800" fontWeight="$bold" fontSize="$3xl">
            ¿Cómo quieres usar PelusApp?
          </Heading>
          <Text textAlign="center" color="$gray500" maxWidth="$80" fontSize="$md">
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </Text>
        </VStack>

        <VStack gap="$4" width="$full">
          {roleOptions.map((option) => (
            <Pressable
              key={option.role}
              onPress={() => handleSelect(option.role)}
              width="$full"
            >
              {({ pressed }) => (
                <Box
                  width="$full"
                  p="$6"
                  rounded="$2xl"
                  borderWidth="$2"
                  borderColor={option.borderColor}
                  backgroundColor={option.bgColor}
                  style={{
                    opacity: pressed ? 0.8 : 1,
                    ...(Platform.OS === 'web' ? {
                      boxShadow: pressed 
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: pressed ? 'scale(0.98)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    } : {
                      elevation: pressed ? 2 : 4,
                    }),
                  }}
                >
                  <HStack gap="$4" alignItems="center" width="$full">
                    <Box w="$12" h="$12" justifyContent="center" alignItems="center">
                      <Box
                        w="$12"
                        h="$12"
                        rounded="$full"
                        backgroundColor={option.iconColor}
                        style={{ opacity: 0.2 }}
                      />
                      {/* Overlay para el icono sin opacidad */}
                      <Box
                        position="absolute"
                        w="$12"
                        h="$12"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons
                          name={option.icon}
                          size={28}
                          color={option.resolvedIconColor as any}
                        />
                      </Box>
                    </Box>
                    <VStack gap="$1" flex={1}>
                      <Heading color="$gray800" fontWeight="$semibold" fontSize="$xl">
                        {option.title}
                      </Heading>
                      <Text color="$gray500" fontSize="$sm">
                        {option.subtitle}
                      </Text>
                    </VStack>
                    <Box>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={gray400 as any}
                      />
                    </Box>
                  </HStack>
                </Box>
              )}
            </Pressable>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}


