import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-1
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ progress, label, showPercent = false }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return (
    <View>
      {(label || showPercent) ? (
        <View className="flex-row justify-between mb-xs">
          {label ? <Text className="text-xs text-text-muted font-sans">{label}</Text> : null}
          {showPercent ? <Text className="text-xs text-text-muted font-sans">{Math.round(clampedProgress * 100)}%</Text> : null}
        </View>
      ) : null}
      <View className="h-1 bg-surface-muted rounded-sm overflow-hidden">
        <View
          className="h-full bg-hero rounded-sm"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </View>
    </View>
  );
}
