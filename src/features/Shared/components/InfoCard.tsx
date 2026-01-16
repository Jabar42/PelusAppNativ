import React from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

interface InfoCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: {
    bg: '$backgroundLight50',
    iconBg: '$primary100',
    iconColor: '$primary600',
    borderColor: '$borderLight200',
  },
  primary: {
    bg: '$primary50',
    iconBg: '$primary200',
    iconColor: '$primary700',
    borderColor: '$primary200',
  },
  success: {
    bg: '$success50',
    iconBg: '$success200',
    iconColor: '$success700',
    borderColor: '$success200',
  },
  warning: {
    bg: '$warning50',
    iconBg: '$warning200',
    iconColor: '$warning700',
    borderColor: '$warning200',
  },
  error: {
    bg: '$error50',
    iconBg: '$error200',
    iconColor: '$error700',
    borderColor: '$error200',
  },
};

export default function InfoCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  backgroundColor,
  onPress,
  variant = 'default',
}: InfoCardProps) {
  const styles = variantStyles[variant];
  const iconSize = useToken('space', '5');
  
  // Resolver color del icono
  const targetColor = iconColor || styles.iconColor;
  
  // Determinar si es un color raw (hex, rgb, rgba, hsl) o un token de Gluestack
  const isRawColor = targetColor.startsWith('#') || 
                     targetColor.startsWith('rgb') || 
                     targetColor.startsWith('hsl');
  
  // Siempre llamar useToken (Rules of Hooks - debe ser incondicional)
  const tokenColor = useToken('colors', (targetColor.startsWith('$') ? targetColor.substring(1) : targetColor) as any);
  
  // Decidir qué color usar después de obtener el token
  const resolvedIconColor = isRawColor ? targetColor : tokenColor;

  const content = (
    <Box
      padding="$4"
      borderRadius="$lg"
      borderWidth="$1"
      backgroundColor={backgroundColor || styles.bg}
      borderColor={styles.borderColor}
      gap="$3"
    >
      <HStack alignItems="center" gap="$3">
        {icon && (
          <Box
            width="$10"
            height="$10"
            borderRadius="$full"
            backgroundColor={styles.iconBg}
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons name={icon} size={iconSize} color={resolvedIconColor} />
          </Box>
        )}
        <VStack flex={1} gap="$1">
          <Text size="sm" color="$text600" fontWeight="$medium">
            {title}
          </Text>
          {value !== undefined && (
            <Heading size="xl" color="$text900">
              {value}
            </Heading>
          )}
          {subtitle && (
            <Text size="xs" color="$text500">
              {subtitle}
            </Text>
          )}
        </VStack>
      </HStack>
    </Box>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        sx={{
          ':active': {
            opacity: 0.8,
          },
        }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}
