import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';

type MetricSize = 'xl' | 'l' | 'm';

interface MetricDisplayProps {
  value: string | number;
  unit?: string;
  size?: MetricSize;
  color?: string;
  onHero?: boolean;
}

const sizeMap: Record<MetricSize, { value: string; unit: string }> = {
  xl: { value: 'text-5xl font-sans-bold', unit: 'text-base font-sans-medium' },
  l: { value: 'text-3xl font-sans-bold', unit: 'text-sm font-sans-medium' },
  m: { value: 'text-xl font-sans-bold', unit: 'text-xs font-sans-medium' },
};

export function MetricDisplay({ value, unit, size = 'm', onHero = false }: MetricDisplayProps) {
  const styles = sizeMap[size];
  const textColor = onHero ? 'text-hero-text' : 'text-text-primary';
  const unitColor = onHero ? 'text-hero-muted' : 'text-text-muted';

  return (
    <View className="flex-row items-baseline gap-xs">
      <Text className={`${styles.value} ${textColor}`}>{value}</Text>
      {unit ? <Text className={`${styles.unit} ${unitColor}`}>{unit}</Text> : null}
    </View>
  );
}
