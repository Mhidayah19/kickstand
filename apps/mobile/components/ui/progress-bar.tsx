import React from 'react';
import { Text, View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ progress, label, showPercent = false }: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clampedProgress * 100);

  return (
    <View className="mt-sm">
      {(label || showPercent) ? (
        <View className="flex-row justify-between mb-xs">
          {label ? <Text className="text-xs font-sans text-muted">{label}</Text> : <View />}
          {showPercent ? <Text className="text-xs font-sans-medium text-muted">{percent}%</Text> : null}
        </View>
      ) : null}
      <View className="h-1 bg-surface-muted rounded-sm overflow-hidden">
        <View
          className="h-full bg-hero rounded-sm"
          style={{ width: `${percent}%` }}
        />
      </View>
    </View>
  );
}
