import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';

type BadgeVariant = 'danger' | 'warning' | 'success' | 'neutral';

interface PillBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  danger: { bg: 'bg-danger-surface', text: 'text-danger' },
  warning: { bg: 'bg-warning-surface', text: 'text-warning' },
  success: { bg: 'bg-success-surface', text: 'text-success' },
  neutral: { bg: 'bg-surface-muted', text: 'text-text-secondary' },
};

export function PillBadge({ label, variant }: PillBadgeProps) {
  const styles = variantStyles[variant];
  return (
    <View className={`${styles.bg} px-sm py-xs rounded-sm`}>
      <Text className={`text-xs font-sans-medium ${styles.text}`}>{label}</Text>
    </View>
  );
}
