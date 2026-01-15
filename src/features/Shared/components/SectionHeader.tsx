import React from 'react';
import { Box, VStack, HStack, Text, Heading, Pressable, useToken } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  variant?: 'default' | 'compact';
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  onAction,
  variant = 'default',
}: SectionHeaderProps) {
  const paddingVertical = variant === 'compact' ? '$2' : '$4';
  const paddingHorizontal = variant === 'compact' ? '$1' : '$0';
  const actionIconSize = useToken('space', '4');
  const primary600 = useToken('colors', 'primary600');

  return (
    <Box
      paddingVertical={paddingVertical}
      paddingHorizontal={paddingHorizontal}
      marginBottom={variant === 'compact' ? '$2' : '$4'}
    >
      <HStack
        justifyContent="space-between"
        alignItems={subtitle ? 'flex-start' : 'center'}
        gap="$4"
      >
        <VStack flex={1} gap="$1">
          <Heading size="md" color="$text900" fontWeight="$bold">
            {title}
          </Heading>
          {subtitle && (
            <Text size="sm" color="$text500">
              {subtitle}
            </Text>
          )}
        </VStack>
        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            padding="$2"
            borderRadius="$md"
            sx={{
              ':hover': {
                backgroundColor: '$backgroundLight100',
              },
              ':active': {
                backgroundColor: '$backgroundLight200',
              },
            }}
          >
            <HStack alignItems="center" gap="$2">
              {actionIcon && (
                <Ionicons name={actionIcon} size={actionIconSize} color={primary600} />
              )}
              <Text size="sm" color="$primary600" fontWeight="$semibold">
                {actionLabel}
              </Text>
            </HStack>
          </Pressable>
        )}
      </HStack>
    </Box>
  );
}
