import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text } from 'react-native';

type StatusVariant = 'expired' | 'danger' | 'warning' | 'neutral';

interface StatusCardProps {
  label: string;
  value: string | number;
  unit: string;
  date: string | null;
  variant: StatusVariant;
}

const variantStyles: Record<StatusVariant, { card: string; value: string; dot: string }> = {
  expired: { card: 'bg-danger', value: 'text-white', dot: 'bg-white' },
  danger: { card: 'bg-danger-surface', value: 'text-danger', dot: 'bg-danger' },
  warning: { card: 'bg-warning-surface', value: 'text-warning', dot: 'bg-warning' },
  neutral: { card: 'bg-surface border border-border', value: 'text-text-primary', dot: 'bg-success' },
};

function PulsingDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View className={`w-1.5 h-1.5 rounded-full ${color}`} style={{ opacity }} />;
}

export function StatusCard({ label, value, unit, date, variant }: StatusCardProps) {
  const styles = variantStyles[variant];

  return (
    <View className={`${styles.card} rounded-xl p-md flex-1`}>
      <View className="flex-row items-center justify-between mb-xs">
        <Text className={`text-xs font-sans-medium ${variant === 'expired' ? 'text-white/70' : 'text-text-muted'}`}>
          {label}
        </Text>
        {variant === 'expired' ? (
          <PulsingDot color={styles.dot} />
        ) : (
          <View className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
        )}
      </View>
      <View className="flex-row items-baseline gap-xs">
        <Text className={`text-3xl font-sans-bold ${styles.value}`}>{value}</Text>
        <Text className={`text-sm font-sans-medium ${variant === 'expired' ? 'text-white/70' : 'text-text-muted'}`}>{unit}</Text>
      </View>
      {date ? <Text className={`text-xs font-sans mt-xs ${variant === 'expired' ? 'text-white/70' : 'text-text-muted'}`}>{date}</Text> : null}
    </View>
  );
}
