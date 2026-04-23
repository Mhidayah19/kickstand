import React from 'react';
import { View, Text } from 'react-native';
import { Eyebrow } from '../ui/atelier';

interface Props {
  count: number;
  bikeModel: string;
  dateLabel: string;
}

export function AttentionHero({ count, bikeModel, dateLabel }: Props) {
  return (
    <View className="mb-8">
      <Eyebrow className="mb-6">{bikeModel} · {dateLabel}</Eyebrow>
      <View className="ml-1">
        <Text
          className="font-display text-ink tracking-[-0.03em]"
          style={{ fontSize: 72, lineHeight: 80 }}
        >
          {count}
        </Text>
        <Text className="font-sans-semibold text-[16px] text-ink mt-1 max-w-[220px]">
          {count === 1 ? 'item needs attention' : 'items need attention'}
        </Text>
      </View>
    </View>
  );
}
