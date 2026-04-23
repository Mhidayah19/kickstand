import { useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface DismissibleCalloutProps {
  eyebrow?: string;
  title: string;
  body: string;
  icon: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss?: () => void;
}

export function DismissibleCallout({
  eyebrow,
  title,
  body,
  icon,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onDismiss,
}: DismissibleCalloutProps) {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const maxHeight = useRef(new Animated.Value(1)).current;

  const handleDismiss = () => {
    Animated.parallel([
      // Native driver: opacity + scale
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 300, useNativeDriver: true }),
      ]),
      // JS driver: maxHeight (cannot use native driver)
      Animated.timing(maxHeight, { toValue: 0, duration: 400, delay: 100, useNativeDriver: false }),
    ]).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale }],
        maxHeight: maxHeight.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }),
        overflow: 'hidden',
      }}
      className="mb-10"
    >
      <View className="relative bg-muted/30 rounded-3xl p-6 pr-10 overflow-hidden">
        <Pressable
          onPress={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface/80 items-center justify-center active:scale-95"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={16} color={colors.ink} />
        </Pressable>
        <View className="flex-row items-start gap-4">
          <View className="w-11 h-11 rounded-2xl bg-ink items-center justify-center">
            <MaterialCommunityIcons name={icon as any} size={22} color={colors.yellow} />
          </View>
          <View className="flex-1 min-w-0">
            {eyebrow && (
              <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-1">
                {eyebrow}
              </Text>
            )}
            <Text className="text-[17px] font-sans-xbold text-ink leading-snug mb-1.5">
              {title}
            </Text>
            <Text className="text-[13px] font-sans-medium text-ink/80 leading-relaxed mb-4">
              {body}
            </Text>
            <View className="flex-row items-center gap-3">
              {primaryLabel && onPrimary && (
                <Pressable
                  onPress={onPrimary}
                  className="px-4 py-2 rounded-full bg-ink active:opacity-80"
                >
                  <Text className="text-[11px] font-sans-bold tracking-wide text-surface">
                    {primaryLabel}
                  </Text>
                </Pressable>
              )}
              {secondaryLabel && onSecondary && (
                <Pressable onPress={onSecondary} className="active:opacity-70">
                  <Text className="text-[11px] font-sans-bold tracking-wide text-ink/70">
                    {secondaryLabel}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
