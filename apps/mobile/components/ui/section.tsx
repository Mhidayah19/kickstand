import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface SectionProps {
  label?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

export function Section({ label, action, onAction, children }: SectionProps) {
  return (
    <View className="mb-lg">
      {(label || action) ? (
        <View className="flex-row items-center justify-between mb-sm">
          {label ? (
            <Text className="text-xs font-sans-medium text-muted uppercase tracking-widest">
              {label}
            </Text>
          ) : <View />}
          {action && onAction ? (
            <TouchableOpacity onPress={onAction}>
              <Text className="text-xs font-sans-medium text-accent">{action}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
