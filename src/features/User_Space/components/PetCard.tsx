/**
 * Componente PetCard: Tarjeta reutilizable para mostrar información de una mascota
 * Usa tema Morado (B2C) para colores de acento
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Pressable,
  Image,
  Icon,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/features/Shared/components/ui/Card/Card';

export interface PetCardProps {
  /**
   * ID de la mascota
   */
  id: string;
  /**
   * Nombre de la mascota
   */
  name: string;
  /**
   * Especie (perro, gato, etc.)
   */
  species?: string;
  /**
   * Raza
   */
  breed?: string;
  /**
   * Fecha de nacimiento (para calcular edad)
   */
  birthDate?: string;
  /**
   * URL de la foto
   */
  photoUrl?: string;
  /**
   * Función que se ejecuta al hacer clic en la tarjeta
   */
  onPress?: () => void;
  /**
   * Función que se ejecuta al hacer clic en editar
   */
  onEdit?: () => void;
  /**
   * Función que se ejecuta al hacer clic en eliminar
   */
  onDelete?: () => void;
}

/**
 * Calcula la edad aproximada en años y meses
 */
function calculateAge(birthDate?: string): string {
  if (!birthDate) return 'Edad desconocida';
  
  const birth = new Date(birthDate);
  const today = new Date();
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }
  return `${years} ${years === 1 ? 'año' : 'años'} ${months} ${months === 1 ? 'mes' : 'meses'}`;
}

/**
 * Componente PetCard con tema Morado (B2C)
 */
export const PetCard: React.FC<PetCardProps> = ({
  name,
  species,
  breed,
  birthDate,
  photoUrl,
  onPress,
  onEdit,
  onDelete,
}) => {
  const age = calculateAge(birthDate);

  return (
    <Pressable onPress={onPress}>
      <Card variant="outline" padding="$4" borderRadius="$lg">
        <HStack gap="$4" alignItems="center">
          {/* Foto de la mascota */}
          <Box
            width={80}
            height={80}
            borderRadius="$full"
            backgroundColor="$purple100"
            overflow="hidden"
            justifyContent="center"
            alignItems="center"
          >
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                alt={name}
                width="100%"
                height="100%"
                resizeMode="cover"
              />
            ) : (
              <Icon
                as={Ionicons}
                name="paw"
                size="$2xl"
                color="$purple600"
              />
            )}
          </Box>

          {/* Información */}
          <VStack flex={1} gap="$1">
            <Heading size="md" color="$text900">
              {name}
            </Heading>
            {species && (
              <Text size="sm" color="$text600">
                {species}
                {breed && ` • ${breed}`}
              </Text>
            )}
            {birthDate && (
              <Text size="xs" color="$text500">
                {age}
              </Text>
            )}
          </VStack>

          {/* Acciones */}
          <VStack gap="$2">
            {onEdit && (
              <Pressable onPress={onEdit}>
                <Icon
                  as={Ionicons}
                  name="pencil"
                  size="$md"
                  color="$purple600"
                />
              </Pressable>
            )}
            {onDelete && (
              <Pressable onPress={onDelete}>
                <Icon
                  as={Ionicons}
                  name="trash-outline"
                  size="$md"
                  color="$error600"
                />
              </Pressable>
            )}
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
};

export default PetCard;
