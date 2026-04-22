import React from 'react';
import { View, Text } from 'react-native';

export interface StatCellProps {
  value: string;
  label: string;
}

export function StatCell({ value, label }: StatCellProps) {
  return (
    <View className="flex-1 bg-bg px-4 py-[14px]">
      <Text className="text-ink font-sans-semibold text-[22px] tracking-[-0.02em]" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      <Text className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-1">
        {label}
      </Text>
    </View>
  );
}
