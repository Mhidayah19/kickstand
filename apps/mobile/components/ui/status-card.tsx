import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export type StatusCardVariant = 'expired' | 'danger' | 'warning' | 'neutral';

interface StatusCardProps {
  label: string;
  value: string | number;
  unit: string;
  date?: string;
  variant: StatusCardVariant;
}

const variantStyles: Record<StatusCardVariant, { card: string; value: string; dot: string }> = {
  expired: { card: 'bg-danger', value: 'text-white', dot: 'bg-white' },
  danger: { card: 'bg-danger-surface', value: 'text-danger', dot: 'bg-danger' },
  warning: { card: 'bg-warning-surface', value: 'text-warning', dot: 'bg-warning' },
  neutral: { card: 'bg-surface border border-border', value: 'text-text-primary', dot: 'bg-success' },
};

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={style}
      className={`w-1.5 h-1.5 rounded-full mr-1 ${color}`}
    />
  );
}

export function StatusCard({ label, value, unit, date, variant }: StatusCardProps) {
  const styles = variantStyles[variant];
  const isPulsing = variant === 'expired';
  const labelColor = variant === 'expired' ? 'text-white/70' : 'text-muted';
  const dateColor = variant === 'expired' ? 'text-white/60' : 'text-muted';

  return (
    <View className={`rounded-xl p-md flex-1 ${styles.card}`}>
      <View className="flex-row items-center mb-xs">
        {isPulsing ? (
          <PulsingDot color={styles.dot} />
        ) : (
          <View className={`w-1.5 h-1.5 rounded-full mr-1 ${styles.dot}`} />
        )}
        <Text className={`text-xs font-sans-medium uppercase tracking-widest ${labelColor}`}>
          {label}
        </Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className={`text-3xl font-sans-bold ${styles.value}`}>{value}</Text>
        <Text className={`text-sm font-sans-medium ml-1 ${styles.value}`}>{unit}</Text>
      </View>
      {date ? (
        <Text className={`text-xs font-sans mt-xs ${dateColor}`}>{date}</Text>
      ) : null}
    </View>
  );
}
