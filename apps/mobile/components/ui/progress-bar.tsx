import { View, Text } from 'react-native';

type ProgressColor = 'yellow' | 'muted' | 'danger' | 'ink';

interface ProgressBarProps {
  value: number;
  color?: ProgressColor;
  label?: string;
  statusText?: string;
  size?: 'sm' | 'md';
}

const colorMap: Record<ProgressColor, string> = {
  yellow: 'bg-yellow',
  muted: 'bg-muted',
  danger: 'bg-danger',
  ink: 'bg-ink',
};

export function ProgressBar({
  value,
  color = 'yellow',
  label,
  statusText,
  size = 'sm',
}: ProgressBarProps) {
  const height = size === 'md' ? 'h-3' : 'h-2';

  return (
    <View>
      {(label || statusText) && (
        <View className="flex-row justify-between items-end mb-2">
          {label && (
            <Text className="font-sans-bold text-sm text-ink uppercase tracking-wide-1">
              {label}
            </Text>
          )}
          {statusText && (
            <Text className={`font-sans-bold text-xs ${color === 'danger' ? 'text-danger' : color === 'muted' ? 'text-muted' : 'text-yellow'}`}>
              {statusText}
            </Text>
          )}
        </View>
      )}
      <View className={`${height} w-full bg-bg-2 rounded-full overflow-hidden`}>
        <View
          className={`h-full ${colorMap[color]} rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </View>
    </View>
  );
}
