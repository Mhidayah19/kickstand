import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-3xl px-lg">
      <Text className="text-base font-sans-bold text-text-primary text-center mb-sm">{title}</Text>
      <Text className="text-sm font-sans text-text-muted text-center mb-xl">{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          className="bg-hero px-xl py-md rounded-full"
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text className="text-hero-text font-sans-semibold text-sm">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
