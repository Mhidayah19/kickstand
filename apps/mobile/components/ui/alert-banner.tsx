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

export function AlertBanner({ children, variant, className = '' }: AlertBannerProps) {
  const styles = variantStyles[variant];
  return (
    <View className={`${styles.bg} rounded-xl p-lg flex-row items-start gap-sm mb-sm ${className}`}>
      <View className={`w-1.5 h-1.5 rounded-full ${styles.dot} mt-1`} />
      <View className="flex-1">{children}</View>
    </View>
  );
}
