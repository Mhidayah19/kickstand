import { Text, View } from 'react-native';
import type { ConfidenceLevel } from '../../lib/prediction/resolve-confidence';

export type { ConfidenceLevel };

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  /** Whether this badge sits on a dark (pedestal) surface. Controls label color. */
  onDark?: boolean;
}

const dotClass: Record<ConfidenceLevel, string> = {
  high: 'bg-success',
  medium: 'bg-yellow',
  low: 'bg-yellow/60',
  unknown: 'bg-hairline-2',
};

const label: Record<ConfidenceLevel, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Early estimate',
  unknown: 'Default',
};

export function ConfidenceBadge({ level, onDark = true }: ConfidenceBadgeProps) {
  const textClass = onDark ? 'text-surface/70' : 'text-ink/55';
  const borderClass = onDark ? 'border-white/10' : 'border-hairline-2';
  const bgClass = onDark ? 'bg-white/5' : 'bg-muted/10';

  return (
    <View className={`flex-row items-center px-3 py-1 rounded-full border ${borderClass} ${bgClass} gap-1.5`}>
      <View className={`w-1.5 h-1.5 rounded-full ${dotClass[level]}`} />
      <Text className={`text-[9px] font-sans-bold tracking-atelier uppercase ${textClass}`}>
        {label[level]}
      </Text>
    </View>
  );
}
