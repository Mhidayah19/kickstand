import React, { useEffect, useRef } from 'react';
import { Animated, Keyboard, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Home, Grid2x2, Plus, Mic, Settings } from 'lucide-react-native';

// Token values matching global.css CSS variables
// IMPORTANT: Keep these in sync with CSS variables defined in global.css
const COLORS = {
  hero: '#1c1917',
  heroMuted: '#78716c',
  white: '#ffffff',
  accent: '#d97706',
} as const;

const TAB_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  index: Home,
  garage: Grid2x2,
  log: Plus,
  agent: Mic,
  settings: Settings,
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(translateY, {
        toValue: 200,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [translateY]);

  return (
    <Animated.View
      className="absolute bottom-4 self-center"
      style={{ transform: [{ translateY }] }}
    >
      <View
        className="bg-hero rounded-full flex-row items-center px-sm py-sm"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = route.name === 'log';
          const Icon = TAB_ICONS[route.name] ?? Home;

          const onPress = () => {
            if (isCenter) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className="w-12 h-12 rounded-full bg-accent items-center justify-center mx-sm"
                style={{ marginTop: -16, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 }}
                activeOpacity={0.8}
              >
                <Plus size={24} color={COLORS.white} strokeWidth={2.5} />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className={`w-10 h-10 items-center justify-center rounded-full mx-xs ${isFocused ? 'bg-white' : ''}`}
              activeOpacity={0.7}
            >
              <Icon size={20} color={isFocused ? COLORS.hero : COLORS.heroMuted} strokeWidth={isFocused ? 2.5 : 2} />
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
