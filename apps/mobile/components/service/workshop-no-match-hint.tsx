import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface Props {
  workshopName: string;
  onPress: () => void;
}

export function WorkshopNoMatchHint({ workshopName, onPress }: Props) {
  return (
    <View className="gap-1 px-1 pt-2">
      <Text className="font-jakarta-medium text-base text-charcoal">{workshopName}</Text>
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text className="font-jakarta-medium text-sm text-charcoal opacity-70">
          No match in your workshops · Tap to select
        </Text>
      </Pressable>
    </View>
  );
}
