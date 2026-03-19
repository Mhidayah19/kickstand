import React from 'react';
import { View } from 'react-native';

type DotVariant = 'danger' | 'warning' | 'success';

interface StatusDotProps {
  variant: DotVariant;
}

const colorMap: Record<DotVariant, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
};

export function StatusDot({ variant }: StatusDotProps) {
  return <View className={`w-1.5 h-1.5 rounded-full ${colorMap[variant]}`} />;
}
