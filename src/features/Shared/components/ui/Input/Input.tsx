import React from 'react';
import { Input as GluestackInput, InputField } from '@gluestack-ui/themed';

export interface InputProps {
  /**
   * Placeholder del input
   */
  placeholder?: string;
  /**
   * Valor del input
   */
  value?: string;
  /**
   * Si el input está deshabilitado
   */
  isDisabled?: boolean;
  /**
   * Si el input está en estado de error
   */
  isInvalid?: boolean;
  /**
   * Tipo de input
   */
  type?: 'text' | 'password' | 'email' | 'number';
  /**
   * Tamaño del input
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Función que se ejecuta cuando cambia el valor
   */
  onChangeText?: (text: string) => void;
  /**
   * Label del input
   */
  label?: string;
}

/**
 * Componente Input del design system
 * Basado en Gluestack UI con props personalizadas
 */
export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  isDisabled = false,
  isInvalid = false,
  type = 'text',
  size = 'md',
  onChangeText,
  label,
  ...props
}) => {
  return (
    <GluestackInput
      size={size}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      {...props}
    >
      <InputField
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        type={type}
      />
    </GluestackInput>
  );
};

export default Input;















