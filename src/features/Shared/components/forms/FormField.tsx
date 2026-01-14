/**
 * Componente FormField: Wrapper para Input con label, error y validación
 * Detecta automáticamente el contexto (B2C/B2B) y aplica el tema correspondiente
 */

import React from 'react';
import { VStack, Text, Input as GluestackInput, InputField } from '@gluestack-ui/themed';
import { useThemeContext } from '@/core/hooks/useThemeContext';

export interface FormFieldProps {
  /**
   * Label del campo
   */
  label?: string;
  /**
   * Mensaje de error a mostrar
   */
  error?: string;
  /**
   * Si el campo es requerido
   */
  isRequired?: boolean;
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
   * Componente de ayuda o descripción
   */
  helperText?: string;
  /**
   * Props adicionales para el Input
   */
  inputProps?: any;
}

/**
 * Componente FormField con detección automática de tema
 * B2C: Tema Morado ($purple600)
 * B2B: Tema Esmeralda ($emerald600)
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  isRequired = false,
  placeholder,
  value,
  isDisabled = false,
  type = 'text',
  size = 'md',
  onChangeText,
  helperText,
  inputProps,
}) => {
  const { colors } = useThemeContext();
  const isInvalid = !!error;

  return (
    <VStack gap="$1" width="100%">
      {label && (
        <Text size="sm" fontWeight="$medium" color="$text900">
          {label}
          {isRequired && <Text color={colors.primary}> *</Text>}
        </Text>
      )}
      
      <GluestackInput
        size={size}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        {...inputProps}
      >
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          type={type}
        />
      </GluestackInput>

      {error && (
        <Text size="xs" color="$error600">
          {error}
        </Text>
      )}

      {helperText && !error && (
        <Text size="xs" color="$text500">
          {helperText}
        </Text>
      )}
    </VStack>
  );
};

export default FormField;
