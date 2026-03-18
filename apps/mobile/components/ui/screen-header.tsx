import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onTitlePress?: () => void;
}

export function ScreenHeader({ title, subtitle, rightAction, onTitlePress }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-lg">
      <View className="flex-1">
        {subtitle ? (
          <Text className="text-xs text-text-muted font-sans-medium">{subtitle}</Text>
        ) : null}
        {onTitlePress ? (
          <TouchableOpacity onPress={onTitlePress}>
            <Text className="text-2xl font-sans-bold text-text-primary">{title}</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-2xl font-sans-bold text-text-primary">{title}</Text>
        )}
      </View>
      {rightAction ? <View>{rightAction}</View> : null}
    </View>
  );
}
