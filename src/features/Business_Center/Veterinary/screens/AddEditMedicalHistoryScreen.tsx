/**
 * Pantalla para agregar o editar un historial médico
 * Fase 2.3: Historiales Médicos (B2B - Veterinary)
 * Auto-asigna location_id desde JWT (active_location_id)
 * Usa tema Esmeralda (B2B)
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
  Pressable,
  Textarea,
  TextareaInput,
  useToken,
} from '@gluestack-ui/themed';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupabaseClient } from '@/core/hooks/useSupabaseClient';
import { useAuth } from '@clerk/clerk-expo';
import { useThemeContext } from '@/core/hooks/useThemeContext';
import FormField from '@/features/Shared/components/forms/FormField';
import DatePickerField from '@/features/Shared/components/forms/DatePickerField';

interface MedicalHistoryFormData {
  pet_id: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export function AddEditMedicalHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const supabase = useSupabaseClient();
  const { userId, getToken } = useAuth();
  const { colors } = useThemeContext();
  const iconMd = useToken('space', '6');
  const text900 = useToken('colors', 'textLight900');
  const isEditing = !!params.id;

  const [formData, setFormData] = useState<MedicalHistoryFormData>({
    pet_id: '',
    visit_date: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const [pets, setPets] = useState<Array<{ id: string; name: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(true);
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
    loadLocationId();
    if (isEditing && params.id) {
      loadHistory(params.id);
    }
  }, [isEditing, params.id]);

  const loadLocationId = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (token) {
        // Decodificar JWT para obtener active_location_id
        const payload = JSON.parse(atob(token.split('.')[1]));
        setLocationId(payload.active_location_id || null);
      }
    } catch (error) {
      console.error('Error loading location ID:', error);
    }
  };

  const loadPets = async () => {
    setIsLoadingPets(true);
    try {
      // Cargar todas las mascotas (sin filtro por owner ya que es B2B)
      const { data, error } = await supabase
        .from('pets')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(100);

      if (error) throw error;
      setPets(data || []);
    } catch (error: any) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoadingPets(false);
    }
  };

  const loadHistory = async (historyId: string) => {
    try {
      const { data, error } = await supabase
        .from('medical_histories')
        .select('*')
        .eq('id', historyId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          pet_id: data.pet_id || '',
          visit_date: data.visit_date || '',
          diagnosis: data.diagnosis || '',
          treatment: data.treatment || '',
          notes: data.notes || '',
        });
        setLocationId(data.location_id);
      }
    } catch (error: any) {
      console.error('Error loading history:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.pet_id) {
      newErrors.pet_id = 'La mascota es requerida';
    }

    if (!formData.visit_date) {
      newErrors.visit_date = 'La fecha de visita es requerida';
    }

    if (!formData.diagnosis?.trim()) {
      newErrors.diagnosis = 'El diagnóstico es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !userId || !locationId) {
      if (!locationId) {
        alert('No se pudo determinar la sede activa. Por favor, selecciona una sede en el Workspace Manager.');
      }
      return;
    }

    setIsLoading(true);
    try {
      const historyData = {
        pet_id: formData.pet_id,
        location_id: locationId,
        veterinarian_id: userId, // Auto-asignado desde JWT
        visit_date: formData.visit_date,
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (isEditing && params.id) {
        const { error } = await supabase
          .from('medical_histories')
          .update(historyData)
          .eq('id', params.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medical_histories')
          .insert(historyData);

        if (error) throw error;
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving medical history:', error);
      alert('Error al guardar el historial: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RNSafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          {/* Header */}
          <HStack alignItems="center" gap="$4">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={iconMd} color={text900} />
            </Pressable>
            <Heading size="xl" color="$text900" flex={1}>
              {isEditing ? 'Editar Historial' : 'Nuevo Historial Médico'}
            </Heading>
          </HStack>

          {/* Formulario */}
          <VStack gap="$4">
            <FormField
              label="Mascota"
              placeholder="Seleccionar mascota"
              value={pets.find(p => p.id === formData.pet_id)?.name || ''}
              onChangeText={() => {}} // Solo lectura, se selecciona de lista
              error={errors.pet_id}
              isRequired
              helperText="Busca y selecciona la mascota"
            />

            <DatePickerField
              label="Fecha de Visita"
              value={formData.visit_date}
              onChangeDate={(date) => setFormData({ ...formData, visit_date: date })}
              error={errors.visit_date}
              isRequired
            />

            <FormField
              label="Diagnóstico"
              placeholder="Diagnóstico de la visita"
              value={formData.diagnosis}
              onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
              error={errors.diagnosis}
              isRequired
            />

            <FormField
              label="Tratamiento"
              placeholder="Tratamiento prescrito (opcional)"
              value={formData.treatment}
              onChangeText={(text) => setFormData({ ...formData, treatment: text })}
            />

            <VStack gap="$1">
              <Text size="sm" fontWeight="$medium" color="$text900">
                Notas
              </Text>
              <Textarea size="md">
                <TextareaInput
                  placeholder="Notas adicionales (opcional)"
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                />
              </Textarea>
            </VStack>

            {locationId && (
              <Box
                padding="$3"
                borderRadius="$md"
                backgroundColor={colors.primaryLight}
                borderWidth="$1"
                borderColor={colors.primary}
              >
                <Text size="xs" color={colors.primary}>
                  Sede activa detectada automáticamente desde tu contexto actual
                </Text>
              </Box>
            )}
          </VStack>

          {/* Botones */}
          <VStack gap="$3" marginTop="$4">
            <Button
              size="lg"
              backgroundColor={colors.primary}
              onPress={handleSubmit}
              isDisabled={isLoading || !locationId}
            >
              <ButtonText>
                {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Historial'}
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
