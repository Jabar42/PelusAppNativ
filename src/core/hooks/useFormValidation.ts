/**
 * Hook genérico para validación de formularios
 * Fase 4.2: Mejoras de UX y Validaciones
 * Soporte para reglas personalizadas y manejo de errores
 */

import { useState, useCallback } from 'react';

export type ValidationRule<T = any> = {
  validator: (value: T, formData?: any) => boolean;
  message: string;
};

export type ValidationRules<T = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export interface UseFormValidationReturn<T> {
  errors: Partial<Record<keyof T, string>>;
  validate: (formData: T) => boolean;
  validateField: (field: keyof T, value: T[keyof T], formData?: T) => string | null;
  clearErrors: () => void;
  setError: (field: keyof T, message: string) => void;
}

/**
 * Hook para validación de formularios con reglas personalizadas
 */
export function useFormValidation<T extends Record<string, any>>(
  rules: ValidationRules<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (field: keyof T, value: T[keyof T], formData?: T): string | null => {
      const fieldRules = rules[field];
      if (!fieldRules) return null;

      for (const rule of fieldRules) {
        if (!rule.validator(value, formData)) {
          return rule.message;
        }
      }

      return null;
    },
    [rules]
  );

  const validate = useCallback(
    (formData: T): boolean => {
      const newErrors: Partial<Record<keyof T, string>> = {};

      for (const field in rules) {
        const fieldRules = rules[field];
        if (!fieldRules) continue;

        const value = formData[field];
        const error = validateField(field, value, formData);

        if (error) {
          newErrors[field] = error;
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules, validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    setError,
  };
}

/**
 * Reglas de validación comunes
 */
export const commonRules = {
  required: <T>(message = 'Este campo es requerido'): ValidationRule<T> => ({
    validator: (value: T) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    },
    message,
  }),

  minLength: <T extends string>(min: number, message?: string): ValidationRule<T> => ({
    validator: (value: T) => value.length >= min,
    message: message || `Debe tener al menos ${min} caracteres`,
  }),

  maxLength: <T extends string>(max: number, message?: string): ValidationRule<T> => ({
    validator: (value: T) => value.length <= max,
    message: message || `Debe tener máximo ${max} caracteres`,
  }),

  email: (message = 'Email inválido'): ValidationRule<string> => ({
    validator: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  number: (message = 'Debe ser un número'): ValidationRule<string> => ({
    validator: (value: string) => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)),
    message,
  }),

  positive: (message = 'Debe ser un número positivo'): ValidationRule<string> => ({
    validator: (value: string) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    },
    message,
  }),
};
