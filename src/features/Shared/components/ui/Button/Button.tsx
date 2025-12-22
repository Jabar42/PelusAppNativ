import React from 'react';
import { Button as GluestackButton, ButtonText } from '@gluestack-ui/themed';

export interface ButtonProps {
  /**
   * Tamaño del botón
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Variante del botón
   */
  variant?: 'solid' | 'outline' | 'link' | 'ghost';
  /**
   * Color del botón
   */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  /**
   * Si el botón está deshabilitado
   */
  isDisabled?: boolean;
  /**
   * Si el botón está en estado de carga
   */
  isLoading?: boolean;
  /**
   * Texto del botón
   */
  children: React.ReactNode;
  /**
   * Función que se ejecuta al hacer click
   */
  onPress?: () => void;
}

/**
 * Componente Button del design system
 * Basado en Gluestack UI con props personalizadas
 */
export const Button: React.FC<ButtonProps> = ({
  size = 'md',
  variant = 'solid',
  colorScheme = 'primary',
  isDisabled = false,
  isLoading = false,
  children,
  onPress,
  ...props
}) => {
  return (
    <GluestackButton
      size={size}
      variant={variant}
      colorScheme={colorScheme}
      isDisabled={isDisabled || isLoading}
      onPress={onPress}
      {...props}
    >
      <ButtonText>{children}</ButtonText>
    </GluestackButton>
  );
};

export default Button;











