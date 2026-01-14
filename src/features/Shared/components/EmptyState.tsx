import React from 'react';
import { Box, VStack, Text, Icon, Heading } from '@gluestack-ui/themed';
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
          <Icon as={Ionicons} name={icon} size="$6xl" color="$primary600" />
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
          <Box
            as="button"
            padding="$3"
            paddingHorizontal="$6"
            borderRadius="$lg"
            backgroundColor="$primary600"
            onPress={onAction}
            sx={{
              ':hover': {
                backgroundColor: '$primary700',
              },
              ':active': {
                backgroundColor: '$primary800',
              },
            }}
          >
            <Text color="$white" fontWeight="$semibold" size="md">
              {actionLabel}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
