import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-hero',
};

export function Toast({ message, variant, onDismiss }: ToastProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 250 }),
      withDelay(2500, withTiming(0, { duration: 300 })),
    );
    const timer = setTimeout(onDismiss, 3050);
    return () => clearTimeout(timer);
  }, [opacity, onDismiss]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[style, { position: 'absolute', top: 60, left: 16, right: 16, zIndex: 999 }]}
      className={`${variantStyles[variant]} rounded-lg px-lg py-md`}
    >
      <Text className="text-sm font-sans-medium text-white text-center">{message}</Text>
    </Animated.View>
  );
}
