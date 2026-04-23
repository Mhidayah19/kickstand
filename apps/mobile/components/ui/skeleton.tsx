import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, View } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({ width, height = 16, rounded = false, className = '' }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-bg-2 ${rounded ? 'rounded-full' : 'rounded-sm'} ${className}`}
      style={{ width, height, opacity }}
    />
  );
}
