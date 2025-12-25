import React from 'react';
import { Box, VStack, Heading, Text, Pressable } from '@gluestack-ui/themed';

export interface CardProps {
  /**
   * Título de la tarjeta
   */
  title?: string;
  /**
   * Subtítulo o descripción
   */
  subtitle?: string;
  /**
   * Contenido de la tarjeta
   */
  children?: React.ReactNode;
  /**
   * Si la tarjeta tiene sombra
   */
  hasShadow?: boolean;
  /**
   * Si la tarjeta es clickeable
   */
  isPressable?: boolean;
  /**
   * Función que se ejecuta al presionar la tarjeta
   */
  onPress?: () => void;
  /**
   * Padding de la tarjeta
   */
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente Card del design system
 * Tarjeta reutilizable con diferentes variantes
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  hasShadow = true,
  isPressable = false,
  onPress,
  padding = 'md',
  ...props
}) => {
  const paddingMap = {
    xs: '$2',
    sm: '$3',
    md: '$4',
    lg: '$5',
    xl: '$6',
  } as const;

  const content = (
    <Box
      bg="$white"
      rounded="$xl"
      p={paddingMap[padding]}
      borderWidth="$1"
      borderColor="$borderLight200"
      {...(hasShadow && {
        softShadow: '2',
      })}
      {...props}
    >
      {(title || subtitle) && (
        <VStack gap="$1" mb={children ? '$3' : '$0'}>
          {title && (
            <Heading size="md" color="$textLight900">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text size="sm" color="$textLight500">
              {subtitle}
            </Text>
          )}
        </VStack>
      )}
      {children}
    </Box>
  );

  if (isPressable && onPress) {
    return (
      <Pressable onPress={onPress} sx={{ _web: { cursor: 'pointer' } }}>
        {content}
      </Pressable>
    );
  }

  return content;
};

export default Card;















