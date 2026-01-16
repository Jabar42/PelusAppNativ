/**
 * AI Command Bar Component
 * Interfaz de chat con el agente de IA
 */

import React, { useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  Input,
  InputField,
  ScrollView,
  Spinner,
  useToken,
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { Platform, KeyboardAvoidingView, ScrollView as RNScrollView } from 'react-native';
import { useAIStore } from '@/core/store/aiStore';
import { useAIChat } from '../hooks/useAIChat';
import { useAIActions } from '../hooks/useAIActions';

interface AICommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AICommandBar({ isOpen, onClose }: AICommandBarProps) {
  const { commandBarInput, setCommandBarInput } = useAIStore();
  const { messages, isLoading, error, sendMessage } = useAIChat();
  const scrollViewRef = useRef<RNScrollView>(null);

  // Hook para ejecutar acciones pendientes
  useAIActions();

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!commandBarInput.trim() || isLoading) return;

    sendMessage(commandBarInput);
    setCommandBarInput('');
  };

  const primary600 = useToken('colors', 'primary600');
  const iconSize = useToken('space', '5');
  const sendIconSize = useToken('space', '6');

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent maxHeight="$5/6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%', flex: 1 }}
        >
          <VStack width="$full" flex={1} padding="$4" gap="$4">
            {/* Header */}
            <HStack justifyContent="space-between" alignItems="center">
              <HStack gap="$2" alignItems="center">
                <Ionicons name="sparkles" size={iconSize} color={primary600} />
                <Text size="xl" fontWeight="$bold">
                  Asistente IA
                </Text>
              </HStack>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={iconSize} color="#666" />
              </Pressable>
            </HStack>

            {/* Messages Area */}
            <ScrollView
              ref={scrollViewRef as any}
              flex={1}
              showsVerticalScrollIndicator={false}
            >
              <VStack gap="$3" paddingBottom="$4">
                {messages.length === 0 && (
                  <VStack gap="$2" paddingVertical="$8" alignItems="center">
                    <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                    <Text size="sm" color="$textLight400" textAlign="center">
                      Pregunta lo que necesites sobre tus mascotas, navega por la app, o consulta información.
                    </Text>
                  </VStack>
                )}

                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}

                {isLoading && (
                  <HStack gap="$2" padding="$3">
                    <Spinner size="small" />
                    <Text size="sm" color="$textLight600">
                      Pensando...
                    </Text>
                  </HStack>
                )}

                {error && (
                  <Box
                    backgroundColor="$error50"
                    padding="$3"
                    borderRadius="$lg"
                    borderWidth="$1"
                    borderColor="$error200"
                  >
                    <Text size="sm" color="$error600">
                      {error}
                    </Text>
                  </Box>
                )}
              </VStack>
            </ScrollView>

            {/* Input Area */}
            <HStack gap="$2" alignItems="center">
              <Input flex={1} variant="outline" size="md">
                <InputField
                  placeholder="Escribe tu mensaje..."
                  value={commandBarInput}
                  onChangeText={setCommandBarInput}
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                />
              </Input>
              <Pressable
                onPress={handleSend}
                disabled={!commandBarInput.trim() || isLoading}
                opacity={!commandBarInput.trim() || isLoading ? 0.5 : 1}
              >
                <Box
                  backgroundColor="$primary600"
                  padding="$3"
                  borderRadius="$full"
                >
                  <Ionicons name="send" size={sendIconSize} color="white" />
                </Box>
              </Pressable>
            </HStack>
          </VStack>
        </KeyboardAvoidingView>
      </ActionsheetContent>
    </Actionsheet>
  );
}

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const backgroundColor = isUser ? '$primary600' : '$backgroundLight100';
  const textColor = isUser ? '$white' : '$textLight900';
  const alignSelf = isUser ? 'flex-end' : 'flex-start';

  return (
    <Box
      maxWidth="85%"
      alignSelf={alignSelf}
      backgroundColor={backgroundColor}
      padding="$3"
      borderRadius="$lg"
    >
      <Text size="sm" color={textColor}>
        {message.content}
      </Text>
      <Text size="2xs" color={isUser ? '$white' : '$textLight400'} marginTop="$1">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Box>
  );
}
