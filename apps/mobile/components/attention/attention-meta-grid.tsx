import React from 'react';
import { View, Text } from 'react-native';

interface MetaCell {
  label: string;
  value: string;
  sub?: string;
}

export function AttentionMetaGrid({ cells }: { cells: MetaCell[] }) {
  return (
    <View className="flex-row flex-wrap gap-4 mb-7">
      {cells.map((cell) => (
        <View key={cell.label} className="flex-1 min-w-[120px]">
          <Text className="font-sans-bold text-xxs text-muted uppercase tracking-widest mb-1.5">
            {cell.label}
          </Text>
          <Text className="font-sans-xbold text-base text-ink">{cell.value}</Text>
          {cell.sub ? (
            <Text className="font-sans-medium text-xxs text-muted mt-0.5">{cell.sub}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
