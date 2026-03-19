import React from 'react';
import { Text, View } from 'react-native';

type MetricSize = 'xl' | 'l' | 'm';

interface MetricDisplayProps {
  value: string | number;
  unit?: string;
  size?: MetricSize;
  onHero?: boolean;
}

const sizeStyles: Record<MetricSize, { value: string; unit: string }> = {
  xl: { value: 'text-5xl font-sans-bold', unit: 'text-base font-sans-medium ml-1' },
  l: { value: 'text-3xl font-sans-bold', unit: 'text-sm font-sans-medium ml-1' },
  m: { value: 'text-xl font-sans-bold', unit: 'text-xs font-sans-medium ml-1' },
};

export function MetricDisplay({ value, unit, size = 'm', onHero = false }: MetricDisplayProps) {
  const styles = sizeStyles[size];
  const colorClass = onHero ? 'text-hero-text' : 'text-text-primary';
  const unitColorClass = onHero ? 'text-hero-muted' : 'text-muted';

  return (
    <View className="flex-row items-baseline">
      <Text className={`${styles.value} ${colorClass}`}>{value}</Text>
      {unit ? <Text className={`${styles.unit} ${unitColorClass}`}>{unit}</Text> : null}
    </View>
  );
}
