import React from 'react';
import { View } from 'react-native';

type AlertVariant = 'danger' | 'warning' | 'info';

interface AlertBannerProps {
  children: React.ReactNode;
  variant: AlertVariant;
  className?: string;
}

const variantStyles: Record<AlertVariant, { bg: string; dot: string }> = {
  danger: { bg: 'bg-danger-surface', dot: 'bg-danger' },
  warning: { bg: 'bg-warning-surface', dot: 'bg-warning' },
  info: { bg: 'bg-accent-surface', dot: 'bg-accent' },
};

export function AlertBanner({ children, variant, className }: AlertBannerProps) {
  const styles = variantStyles[variant];
  return (
    <View className={`rounded-xl p-lg flex-row items-start mb-sm ${styles.bg} ${className ?? ''}`}>
      <View className={`w-2 h-2 rounded-full mt-0.5 mr-sm flex-shrink-0 ${styles.dot}`} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
