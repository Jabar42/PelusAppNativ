import React from 'react';
import { useRouter } from 'expo-router';
import { Pressable, Platform } from 'react-native';
import { VStack, Heading, Text, Box, HStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '@/core/store/onboardingStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { setPendingRole } = useOnboardingStore();

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
      icon: 'medical-outline' as keyof typeof Ionicons.glyphMap,
      bgColor: '#eff6ff', // blue-50
      borderColor: '#bfdbfe', // blue-200
      iconColor: '#3b82f6',
    },
    {
      role: 'B2C' as const,
      title: 'Soy dueño de mascotas',
      subtitle: 'Controla vacunas, citas y bienestar de tus peludos.',
      icon: 'heart-outline' as keyof typeof Ionicons.glyphMap,
      bgColor: '#faf5ff', // purple-50
      borderColor: '#e9d5ff', // purple-200
      iconColor: '#a855f7',
    },
  ];

  return (
    <Box className="flex-1 bg-white">
      <VStack
        gap={24}
        className="flex-1 px-6 py-12 justify-center"
      >
        <VStack gap={12} className="items-center mb-8">
          <Heading className="text-center text-gray-900 font-bold" style={{ fontSize: 32 }}>
            ¿Cómo quieres usar PelusApp?
          </Heading>
          <Text className="text-center text-gray-600 max-w-sm" style={{ fontSize: 16 }}>
            Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
          </Text>
        </VStack>

        <VStack gap={16} className="w-full">
          {roleOptions.map((option, index) => (
            <Pressable
              key={option.role}
              onPress={() => handleSelect(option.role)}
              className="w-full"
              style={{
                marginBottom: index < roleOptions.length - 1 ? 16 : 0,
              }}
            >
              {({ pressed }) => (
                <Box
                  className="w-full"
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: option.borderColor,
                    backgroundColor: option.bgColor,
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
                  <HStack gap={16} className="items-center">
                    <Box
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: `${option.iconColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className="items-center justify-center"
                    >
                      <Ionicons
                        name={option.icon}
                        size={28}
                        color={option.iconColor}
                      />
                    </Box>
                    <VStack gap={4} className="flex-1">
                      <Heading className="text-gray-900 font-semibold" style={{ fontSize: 20 }}>
                        {option.title}
                      </Heading>
                      <Text className="text-gray-600" style={{ fontSize: 14 }}>
                        {option.subtitle}
                      </Text>
                    </VStack>
                    <Box style={{ marginLeft: 'auto' }}>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#9ca3af"
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


