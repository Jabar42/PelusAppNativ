/**
 * Componente SelectField: Select con búsqueda y validación
 * Detecta automáticamente el contexto (B2C/B2B) y aplica el tema correspondiente
 */

import React, { useState } from 'react';
import { VStack, Text, Select as GluestackSelect, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem, useToken } from '@gluestack-ui/themed';
import { useThemeContext } from '@/core/hooks/useThemeContext';
import { Ionicons } from '@expo/vector-icons';

export interface SelectFieldOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
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
   * Opciones del select
   */
  options: SelectFieldOption[];
  /**
   * Valor seleccionado
   */
  value?: string;
  /**
   * Si el campo está deshabilitado
   */
  isDisabled?: boolean;
  /**
   * Función que se ejecuta cuando cambia la selección
   */
  onValueChange?: (value: string) => void;
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
 * Componente SelectField con detección automática de tema
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  error,
  isRequired = false,
  options,
  value,
  isDisabled = false,
  onValueChange,
  placeholder = 'Seleccionar opción',
  helperText,
}) => {
  const { colors } = useThemeContext();
  const isInvalid = !!error;
  const iconSize = useToken('space', '6');

  return (
    <VStack gap="$1" width="100%">
      {label && (
        <Text size="sm" fontWeight="$medium" color="$text900">
          {label}
          {isRequired && <Text color={colors.primary}> *</Text>}
        </Text>
      )}
      
      <GluestackSelect
        selectedValue={value}
        onValueChange={onValueChange}
        isDisabled={isDisabled}
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput placeholder={placeholder} />
          <SelectIcon>
            <Ionicons name="chevron-down" size={iconSize} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </SelectContent>
        </SelectPortal>
      </GluestackSelect>

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

export default SelectField;
