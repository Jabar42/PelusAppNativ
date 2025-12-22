import React from 'react';
import { Box, VStack, HStack, Heading, Text } from '@gluestack-ui/themed';

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
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: paddingMap[padding],
    ...(hasShadow && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  };

  const content = (
    <Box style={cardStyle} {...props}>
      {(title || subtitle) && (
        <VStack space="xs" marginBottom={children ? 12 : 0}>
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
      <Box onPress={onPress} style={{ cursor: 'pointer' }}>
        {content}
      </Box>
    );
  }

  return content;
};

export default Card;














