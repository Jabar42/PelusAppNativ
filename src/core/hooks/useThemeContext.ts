/**
 * Hook para detectar el contexto actual (B2C o B2B) y obtener los colores del tema correspondiente.
 * 
 * B2C (User_Space): Tema Morado
 * B2B (Business_Center): Tema Esmeralda
 */

import { useOrganization } from '@clerk/clerk-expo';

export type ThemeContext = 'B2C' | 'B2B';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
}

/**
 * Hook que detecta el contexto actual y retorna los colores del tema correspondiente.
 * 
 * @returns Objeto con el contexto actual y los colores del tema
 */
export function useThemeContext() {
  const { organization } = useOrganization();
  const context: ThemeContext = organization ? 'B2B' : 'B2C';

  const colors: ThemeColors = context === 'B2C' 
    ? {
        // Tema Morado para B2C
        primary: '$purple600',
        primaryLight: '$purple50',
        primaryDark: '$purple700',
        accent: '$purple500',
        accentLight: '$purple100',
      }
    : {
        // Tema Esmeralda para B2B
        primary: '$emerald600',
        primaryLight: '$emerald50',
        primaryDark: '$emerald700',
        accent: '$emerald500',
        accentLight: '$emerald100',
      };

  return {
    context,
    colors,
    isB2C: context === 'B2C',
    isB2B: context === 'B2B',
  };
}
