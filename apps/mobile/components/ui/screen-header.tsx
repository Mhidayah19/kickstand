import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onTitlePress?: () => void;
}

export function ScreenHeader({ title, subtitle, rightAction, onTitlePress }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between pt-sm pb-lg">
      <View className="flex-1">
        {subtitle ? (
          <Text className="text-xs font-sans text-muted mb-0.5">{subtitle}</Text>
        ) : null}
        <TouchableOpacity onPress={onTitlePress} disabled={!onTitlePress} activeOpacity={onTitlePress ? 0.7 : 1}>
          <Text className="text-2xl font-sans-bold text-text-primary">{title}</Text>
        </TouchableOpacity>
      </View>
      {rightAction ? <View className="ml-sm">{rightAction}</View> : null}
    </View>
  );
}
