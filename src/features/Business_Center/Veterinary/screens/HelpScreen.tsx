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
    question: '¿Cómo agrego una nueva sede?',
    answer:
      'Ve a Configuración > Gestión de Sedes y haz clic en "Nueva Sede". Completa el formulario con la información de la sede y guárdala.',
  },
  {
    question: '¿Cómo asigno usuarios a sedes específicas?',
    answer:
      'Ve a Configuración > Asignaciones de Usuarios. Selecciona un usuario y asígnalo a una o más sedes con el rol correspondiente.',
  },
  {
    question: '¿Cómo cambio la sede activa?',
    answer:
      'Desde el WorkspaceManager en tu perfil, puedes seleccionar la sede activa. Esto afectará qué datos ves en el dashboard.',
  },
  {
    question: '¿Cómo gestiono los permisos de mi equipo?',
    answer:
      'Los permisos se gestionan a través de los roles en Clerk. Los administradores pueden asignar roles a los miembros de la organización.',
  },
  {
    question: '¿Cómo exporto los datos de mis pacientes?',
    answer:
      'Esta funcionalidad estará disponible próximamente. Podrás exportar datos desde la sección de reportes.',
  },
  {
    question: '¿Cómo contacto con soporte técnico?',
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
              Centro de Ayuda Profesional
            </Heading>
            <Text size="md" color="$text600">
              Guías y soporte para profesionales
            </Text>
          </VStack>

          {/* Guías Rápidas */}
          <VStack gap="$4">
            <SectionHeader
              title="Guías Profesionales"
              subtitle="Aprende a gestionar tu negocio"
              variant="compact"
            />

            <VStack>
              <HelpMenuItem
                icon="business-outline"
                label="Guía de Inicio para Negocios"
                description="Configura tu organización paso a paso"
              />
              <HelpMenuItem
                icon="location-outline"
                label="Gestión de Sedes"
                description="Cómo crear y administrar múltiples sedes"
              />
              <HelpMenuItem
                icon="people-outline"
                label="Gestión de Equipo"
                description="Asignar usuarios y gestionar permisos"
              />
              <HelpMenuItem
                icon="bar-chart-outline"
                label="Reportes y Analytics"
                description="Entiende tus métricas y reportes"
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
              title="Soporte Profesional"
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
              <HelpMenuItem
                icon="calendar-outline"
                label="Agendar Llamada"
                description="Programa una llamada con nuestro equipo"
                onPress={() => {
                  // Abrir calendario
                }}
              />
            </VStack>
          </VStack>

          {/* Recursos Adicionales */}
          <VStack gap="$4">
            <SectionHeader
              title="Recursos"
              variant="compact"
            />

            <VStack>
              <HelpMenuItem
                icon="document-text-outline"
                label="Documentación API"
                description="Integra PelusApp con tu sistema"
              />
              <HelpMenuItem
                icon="videocam-outline"
                label="Video Tutoriales"
                description="Aprende viendo videos paso a paso"
              />
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
