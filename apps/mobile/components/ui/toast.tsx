import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { Text } from 'react-native';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
}

const variantStyles: Record<ToastVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-success-surface', text: 'text-success' },
  error: { bg: 'bg-danger-surface', text: 'text-danger' },
  info: { bg: 'bg-accent-surface', text: 'text-accent' },
};

export function Toast({ message, variant, onDismiss }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const onDismissRef = useRef(onDismiss);
  const styles = variantStyles[variant];

  // Keep ref current without re-triggering animation
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    anim.start(() => onDismissRef.current());
    return () => anim.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <Animated.View
      className={`absolute top-16 left-lg right-lg ${styles.bg} rounded-xl px-lg py-md`}
      style={{ opacity, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 4 }}
    >
      <Text className={`text-sm font-sans-medium ${styles.text}`}>{message}</Text>
    </Animated.View>
  );
}
