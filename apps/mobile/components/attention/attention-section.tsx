import React from 'react';
import { View, Text } from 'react-native';
import { AttentionRow } from './attention-row';
import type { AttentionItem } from '../../lib/types/attention';

interface Props {
  title: string;
  items: AttentionItem[];
  onItemPress: (item: AttentionItem) => void;
}

export function AttentionSection({ title, items, onItemPress }: Props) {
  if (items.length === 0) return null;
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3.5">
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest">
          {title}
        </Text>
        <Text className="font-sans-bold text-xxs text-charcoal">
          {items.length}
        </Text>
      </View>
      {items.map((item) => (
        <AttentionRow key={`${item.category}-${item.key}`} item={item} onPress={() => onItemPress(item)} />
      ))}
    </View>
  );
}
