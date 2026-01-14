import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  ScrollView,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/features/Shared/components/SectionHeader';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: '¿Cómo agrego una mascota?',
    answer:
      'Puedes agregar una mascota desde la pantalla principal. Haz clic en "Agregar Mascota" y completa el formulario con la información de tu mascota.',
  },
  {
    question: '¿Cómo busco servicios veterinarios?',
    answer:
      'Explora la sección de servicios desde el menú principal. Puedes filtrar por tipo de servicio, ubicación y calificaciones.',
  },
  {
    question: '¿Cómo guardo mis servicios favoritos?',
    answer:
      'Cuando encuentres un servicio que te guste, haz clic en el ícono de corazón para agregarlo a tus favoritos. Puedes acceder a ellos desde la pestaña "Favoritos".',
  },
  {
    question: '¿Cómo cambio mi información de perfil?',
    answer:
      'Ve a la pestaña "Perfil" y haz clic en "Editar Perfil". Desde allí podrás actualizar tu información personal.',
  },
  {
    question: '¿Cómo contacto con soporte?',
    answer:
      'Puedes contactarnos a través del formulario de contacto en esta pantalla o enviando un email a soporte@pelusapp.com',
  },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <Box
      borderWidth="$1"
      borderColor="$borderLight200"
      borderRadius="$lg"
      backgroundColor="$white"
      marginBottom="$2"
    >
      <Pressable onPress={onToggle}>
        {({ pressed }) => (
          <Box
            padding="$4"
            backgroundColor={pressed ? '$backgroundLight50' : 'transparent'}
            borderRadius="$lg"
          >
            <HStack alignItems="center" justifyContent="space-between" gap="$3">
              <Text flex={1} size="md" fontWeight="$semibold" color="$text900">
                {faq.question}
              </Text>
              <Icon
                as={Ionicons}
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size="$md"
                color="$text600"
              />
            </HStack>
            {isOpen && (
              <Text size="sm" color="$text600" marginTop="$3" paddingLeft="$0">
                {faq.answer}
              </Text>
            )}
          </Box>
        )}
      </Pressable>
    </Box>
  );
}

function HelpMenuItem({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          padding="$4"
          borderRadius="$lg"
          backgroundColor={pressed ? '$backgroundLight100' : '$white'}
          borderWidth="$1"
          borderColor="$borderLight200"
          marginBottom="$3"
        >
          <HStack alignItems="center" gap="$4">
            <Box
              width="$10"
              height="$10"
              borderRadius="$lg"
              backgroundColor="$primary100"
              justifyContent="center"
              alignItems="center"
            >
              <Icon as={Ionicons} name={icon} size="$md" color="$primary600" />
            </Box>
            <VStack flex={1} gap="$1">
              <Text size="md" fontWeight="$semibold" color="$text900">
                {label}
              </Text>
              {description && (
                <Text size="sm" color="$text600">
                  {description}
                </Text>
              )}
            </VStack>
            <Icon as={Ionicons} name="chevron-forward" size="$md" color="$text400" />
          </HStack>
        </Box>
      )}
    </Pressable>
  );
}

export function HelpScreen() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView flex={1} backgroundColor="$backgroundLight50">
        <Box padding="$6" gap="$6">
          <VStack gap="$2">
            <Heading size="2xl" color="$text900" fontWeight="$bold">
              Centro de Ayuda
            </Heading>
            <Text size="md" color="$text600">
              Encuentra respuestas y obtén soporte
            </Text>
          </VStack>

          {/* Guías Rápidas */}
          <VStack gap="$4">
            <SectionHeader
              title="Guías Rápidas"
              subtitle="Aprende a usar la aplicación"
              variant="compact"
            />

            <VStack>
              <HelpMenuItem
                icon="book-outline"
                label="Guía de Inicio Rápido"
                description="Aprende los conceptos básicos"
              />
              <HelpMenuItem
                icon="paw-outline"
                label="Gestionar Mascotas"
                description="Cómo agregar y editar mascotas"
              />
              <HelpMenuItem
                icon="search-outline"
                label="Buscar Servicios"
                description="Encuentra servicios veterinarios"
              />
            </VStack>
          </VStack>

          {/* Preguntas Frecuentes */}
          <VStack gap="$4">
            <SectionHeader
              title="Preguntas Frecuentes"
              subtitle="Respuestas a las preguntas más comunes"
              variant="compact"
            />

            <VStack>
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  isOpen={openFAQ === index}
                  onToggle={() => toggleFAQ(index)}
                />
              ))}
            </VStack>
          </VStack>

          {/* Contacto de Soporte */}
          <VStack gap="$4">
            <SectionHeader
              title="Contacto"
              subtitle="¿Necesitas ayuda adicional?"
              variant="compact"
            />

            <VStack>
              <HelpMenuItem
                icon="mail-outline"
                label="Email de Soporte"
                description="soporte@pelusapp.com"
                onPress={() => {
                  // Abrir cliente de email
                }}
              />
              <HelpMenuItem
                icon="chatbubble-outline"
                label="Chat en Vivo"
                description="Disponible de 9 AM a 6 PM"
                onPress={() => {
                  // Abrir chat
                }}
              />
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
