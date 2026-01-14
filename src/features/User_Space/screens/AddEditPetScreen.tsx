/**
 * Pantalla para agregar o editar una mascota
 * Fase 1.3: CRUD de Mascotas (B2C)
 * Usa tema Morado (B2C) en componentes de formulario
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  SafeAreaView,
  Button,
  ButtonText,
  Icon,
  Pressable,
  Image,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import FormField from '@/features/Shared/components/forms/FormField';
import DatePickerField from '@/features/Shared/components/forms/DatePickerField';
import SelectField from '@/features/Shared/components/forms/SelectField';
import { useThemeContext } from '@/core/hooks/useThemeContext';

interface PetFormData {
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  weight: string;
  gender: string;
  color: string;
  notes: string;
  photo_url: string;
}

const SPECIES_OPTIONS = [
  { label: 'Perro', value: 'dog' },
  { label: 'Gato', value: 'cat' },
  { label: 'Conejo', value: 'rabbit' },
  { label: 'Ave', value: 'bird' },
  { label: 'Otro', value: 'other' },
];

const GENDER_OPTIONS = [
  { label: 'Macho', value: 'male' },
  { label: 'Hembra', value: 'female' },
  { label: 'Desconocido', value: 'unknown' },
];

export function AddEditPetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const supabase = useSupabaseClient();
  const { userId } = useAuth();
  const { colors } = useThemeContext();
  const isEditing = !!params.id;

  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    birth_date: '',
    weight: '',
    gender: '',
    color: '',
    notes: '',
    photo_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPet, setIsLoadingPet] = useState(isEditing);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && params.id) {
      loadPet(params.id);
    }
  }, [isEditing, params.id]);

  const loadPet = async (petId: string) => {
    if (!userId) return;

    setIsLoadingPet(true);
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          species: data.species || '',
          breed: data.breed || '',
          birth_date: data.birth_date || '',
          weight: data.weight?.toString() || '',
          gender: data.gender || '',
          color: data.color || '',
          notes: data.notes || '',
          photo_url: data.photo_url || '',
        });
        if (data.photo_url) {
          setSelectedImage(data.photo_url);
        }
      }
    } catch (error: any) {
      console.error('Error loading pet:', error);
    } finally {
      setIsLoadingPet(false);
    }
  };

  const pickImage = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos para acceder a las fotos. Por favor, habilita los permisos en la configuración de la app.'
        );
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Por favor, intenta de nuevo.');
    }
  };

  const uploadPhoto = async (localUri: string, petId: string): Promise<string | null> => {
    if (!userId) return null;

    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${userId}/${petId}/${fileName}`;

      // Leer el archivo como blob usando fetch
      // En React Native, fetch puede manejar URIs locales (file://) directamente
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('pet-photos')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'No se pudo subir la foto. Por favor, intenta de nuevo.');
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.species) {
      newErrors.species = 'La especie es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !userId) return;

    setIsLoading(true);
    try {
      let photoUrl = formData.photo_url;

      // Si hay una imagen nueva seleccionada, subirla
      if (selectedImage && selectedImage !== formData.photo_url && selectedImage.startsWith('file://')) {
        // Generar ID temporal si no estamos editando
        const petId = params.id || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const uploadedUrl = await uploadPhoto(selectedImage, petId);
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || null,
        birth_date: formData.birth_date || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender || null,
        color: formData.color.trim() || null,
        notes: formData.notes.trim() || null,
        photo_url: photoUrl || null,
        owner_id: userId,
      };

      if (isEditing && params.id) {
        // Actualizar
        const { error } = await supabase
          .from('pets')
          .update(petData)
          .eq('id', params.id);

        if (error) throw error;
      } else {
        // Crear
        const { error } = await supabase
          .from('pets')
          .insert(petData);

        if (error) throw error;
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Error al guardar la mascota: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPet) {
    return (
      <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text>Cargando...</Text>
        </Box>
      </RNSafeAreaView>
    );
  }

  return (
    <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <HStack alignItems="center" gap="$4">
            <Pressable onPress={() => router.back()}>
              <Icon as={Ionicons} name="arrow-back" size="$xl" color="$text900" />
            </Pressable>
            <Heading size="xl" color="$text900" flex={1}>
              {isEditing ? 'Editar Mascota' : 'Agregar Mascota'}
            </Heading>
          </HStack>

          {/* Foto */}
          <VStack gap="$2" alignItems="center">
            <Pressable onPress={pickImage}>
              <Box
                width={120}
                height={120}
                borderRadius="$full"
                backgroundColor={colors.primaryLight}
                justifyContent="center"
                alignItems="center"
                borderWidth="$2"
                borderColor={colors.primary}
                overflow="hidden"
              >
                {selectedImage ? (
                  <Image
                    source={{ uri: selectedImage }}
                    alt="Foto de mascota"
                    width="100%"
                    height="100%"
                    resizeMode="cover"
                  />
                ) : (
                  <VStack alignItems="center" gap="$1">
                    <Icon
                      as={Ionicons}
                      name="camera"
                      size="$2xl"
                      color={colors.primary}
                    />
                    <Text size="xs" color={colors.primary}>
                      Agregar foto
                    </Text>
                  </VStack>
                )}
              </Box>
            </Pressable>
          </VStack>

          {/* Formulario */}
          <VStack gap="$4">
            <FormField
              label="Nombre"
              placeholder="Nombre de la mascota"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              error={errors.name}
              isRequired
            />

            <SelectField
              label="Especie"
              options={SPECIES_OPTIONS}
              value={formData.species}
              onValueChange={(value) => setFormData({ ...formData, species: value })}
              error={errors.species}
              isRequired
              placeholder="Seleccionar especie"
            />

            <FormField
              label="Raza"
              placeholder="Raza de la mascota (opcional)"
              value={formData.breed}
              onChangeText={(text) => setFormData({ ...formData, breed: text })}
            />

            <DatePickerField
              label="Fecha de Nacimiento"
              value={formData.birth_date}
              onChangeDate={(date) => setFormData({ ...formData, birth_date: date })}
              placeholder="Seleccionar fecha"
            />

            <HStack gap="$4">
              <Box flex={1}>
                <FormField
                  label="Peso (kg)"
                  placeholder="0.00"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  type="number"
                />
              </Box>
              <Box flex={1}>
                <SelectField
                  label="Género"
                  options={GENDER_OPTIONS}
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  placeholder="Seleccionar"
                />
              </Box>
            </HStack>

            <FormField
              label="Color"
              placeholder="Color de la mascota (opcional)"
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
            />

            <VStack gap="$1">
              <Text size="sm" fontWeight="$medium" color="$text900">
                Notas
              </Text>
              <Textarea size="md">
                <TextareaInput
                  placeholder="Notas adicionales sobre la mascota (opcional)"
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </Textarea>
            </VStack>
          </VStack>

          {/* Botones */}
          <VStack gap="$3" marginTop="$4">
            <Button
              size="lg"
              backgroundColor={colors.primary}
              onPress={handleSubmit}
              isDisabled={isLoading}
            >
              <ButtonText>
                {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Mascota'}
              </ButtonText>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={() => router.back()}
              isDisabled={isLoading}
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </RNSafeAreaView>
  );
}
