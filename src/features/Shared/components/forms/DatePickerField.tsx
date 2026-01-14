/**
 * Componente DatePickerField: Input de fecha con validación y formato consistente
 * Detecta automáticamente el contexto (B2C/B2B) y aplica el tema correspondiente
 */

import React, { useState } from 'react';
import { VStack, Text, Input as GluestackInput, InputField, Pressable } from '@gluestack-ui/themed';
import { useThemeContext } from '@/core/hooks/useThemeContext';
import { Ionicons } from '@expo/vector-icons';

export interface DatePickerFieldProps {
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
   * Valor de la fecha (formato YYYY-MM-DD)
   */
  value?: string;
  /**
   * Si el campo está deshabilitado
   */
  isDisabled?: boolean;
  /**
   * Función que se ejecuta cuando cambia la fecha
   */
  onChangeDate?: (date: string) => void;
  /**
   * Placeholder
   */
  placeholder?: string;
  /**
   * Componente de ayuda o descripción
   */
  helperText?: string;
}

/**
 * Componente DatePickerField con detección automática de tema
 * Por ahora usa un input de tipo date (nativo en web, modal en móvil)
 */
export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  error,
  isRequired = false,
  value,
  isDisabled = false,
  onChangeDate,
  placeholder = 'Seleccionar fecha',
  helperText,
}) => {
  const { colors } = useThemeContext();
  const isInvalid = !!error;

  const handleDateChange = (text: string) => {
    if (onChangeDate) {
      onChangeDate(text);
    }
  };

  return (
    <VStack gap="$1" width="100%">
      {label && (
        <Text size="sm" fontWeight="$medium" color="$text900">
          {label}
          {isRequired && <Text color={colors.primary}> *</Text>}
        </Text>
      )}
      
      <GluestackInput
        size="md"
        isDisabled={isDisabled}
        isInvalid={isInvalid}
      >
        <InputField
          type="date"
          value={value}
          onChangeText={handleDateChange}
          placeholder={placeholder}
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

export default DatePickerField;
