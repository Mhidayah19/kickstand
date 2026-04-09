import React from 'react';
import { View, Text } from 'react-native';

export function AttentionAllClearFooter({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <View className="flex-row items-center gap-3 py-5 px-1 mt-4">
      <View className="flex-1 h-px bg-sand/35" />
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest">
        {count} {count === 1 ? 'Other' : 'Others'} OK
      </Text>
      <View className="flex-1 h-px bg-sand/35" />
    </View>
  );
}
