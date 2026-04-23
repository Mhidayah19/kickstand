import React from 'react';
import { View, Text } from 'react-native';
import { Eyebrow } from '../ui/atelier';
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
      <View className="flex-row items-center justify-between mb-2">
        <Eyebrow>{title}</Eyebrow>
        <Eyebrow>{items.length}</Eyebrow>
      </View>
      <View>
        {items.map((item, i) => (
          <React.Fragment key={`${item.category}-${item.key}`}>
            {i > 0 && <View className="h-px bg-hairline" />}
            <AttentionRow item={item} onPress={() => onItemPress(item)} />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
