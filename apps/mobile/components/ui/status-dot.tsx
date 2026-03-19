import React from 'react';
import { View } from 'react-native';

type DotVariant = 'danger' | 'warning' | 'success';

const variantColor: Record<DotVariant, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
};

export function StatusDot({ variant }: { variant: DotVariant }) {
  return <View className={`w-1.5 h-1.5 rounded-full ${variantColor[variant]}`} />;
}
