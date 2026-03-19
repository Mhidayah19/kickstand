import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-3xl px-lg">
      <Text className="text-lg font-sans-bold text-text-primary text-center mb-sm">{title}</Text>
      <Text className="text-sm font-sans text-muted text-center mb-lg">{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          className="bg-hero px-xl py-md rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-sm font-sans-semibold text-hero-text">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
