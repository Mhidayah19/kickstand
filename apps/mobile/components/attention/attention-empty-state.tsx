import React from 'react';
import { View, Text } from 'react-native';

export function AttentionEmptyState({ bikeModel }: { bikeModel: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="font-sans-xbold text-ink mb-2" style={{ fontSize: 32 }}>
        All clear
      </Text>
      <Text className="font-sans-medium text-sm text-muted text-center">
        Nothing needs your attention on {bikeModel}
      </Text>
    </View>
  );
}
