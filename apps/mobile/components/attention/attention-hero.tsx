import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  count: number;
  bikeModel: string;
  dateLabel: string;
}

export function AttentionHero({ count, bikeModel, dateLabel }: Props) {
  return (
    <View className="mb-10">
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-3">
        {bikeModel} · {dateLabel}
      </Text>
      <Text
        className="font-sans-xbold text-charcoal mb-2"
        style={{ fontSize: 64, lineHeight: 60, letterSpacing: -2 }}
      >
        {count}
      </Text>
      <Text className="font-sans-bold text-base text-charcoal max-w-[220px]">
        {count === 1 ? 'item needs your attention' : 'items need your attention'}{' '}
        <Text className="text-sand">on your {bikeModel}</Text>
      </Text>
    </View>
  );
}
