import React from 'react';
import { Box, VStack, Text, Heading, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const iconSize = useToken('space', '12');
  const primary600 = useToken('colors', 'primary600');

  return (
    <Box flex={1} justifyContent="center" alignItems="center" padding="$6">
      <VStack alignItems="center" gap="$6" width="$full" maxWidth="$96">
        <Box
          width="$20"
          height="$20"
          borderRadius="$full"
          backgroundColor="$primary100"
          justifyContent="center"
          alignItems="center"
        >
          <Ionicons name={icon} size={iconSize} color={primary600} />
        </Box>

        <VStack alignItems="center" gap="$2">
          <Heading size="lg" color="$text900" textAlign="center">
            {title}
          </Heading>
          {description && (
            <Text size="md" color="$text600" textAlign="center" maxWidth="$80">
              {description}
            </Text>
          )}
        </VStack>

        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            sx={{
              ':active': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              padding="$3"
              paddingHorizontal="$6"
              borderRadius="$lg"
              backgroundColor="$primary600"
            >
              <Text color="$white" fontWeight="$semibold" size="md">
                {actionLabel}
              </Text>
            </Box>
          </Pressable>
        )}
      </VStack>
    </Box>
  );
}
