import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Grid2x2, Home, Mic, Plus, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Text, TouchableOpacity, View } from 'react-native';

const ROUTES = [
  { name: 'index', Icon: Home, label: 'Home' },
  { name: 'garage', Icon: Grid2x2, label: 'Garage' },
  { name: 'log', Icon: Plus, label: '' }, // center FAB — no label
  { name: 'agent', Icon: Mic, label: 'Agent' },
  { name: 'settings', Icon: Settings, label: 'Settings' },
] as const;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return (
    <View className="absolute bottom-4 left-4 right-4 items-center" pointerEvents="box-none">
      <View
        className="bg-hero rounded-full flex-row items-center px-sm"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          elevation: 10,
          height: 64,
        }}
      >
        {state.routes.map((route, index) => {
          const routeConfig = ROUTES[index];
          if (!routeConfig) return null;

          const isFocused = state.index === index;
          const isCenter = routeConfig.name === 'log';
          const { Icon } = routeConfig;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
            if (isCenter) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          };

          if (isCenter) {
            // Center FAB
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                className="mx-sm items-center justify-center rounded-full bg-accent"
                style={{
                  width: 52,
                  height: 52,
                  marginTop: -16,
                  shadowColor: '#d97706',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                activeOpacity={0.85}
              >
                <Icon size={22} color="#ffffff" />
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="items-center justify-center mx-xs"
              style={{ width: 52, height: 52 }}
              activeOpacity={0.7}
            >
              {isFocused ? (
                <View
                  className="items-center justify-center rounded-full"
                  style={{ width: 40, height: 40, backgroundColor: 'rgba(250, 248, 245, 0.2)' }}
                >
                  <Icon size={20} color="#faf8f5" />
                </View>
              ) : (
                <Icon size={20} color="#78716c" />
              )}
              {routeConfig.label ? (
                <Text
                  className={`text-xs font-sans-medium mt-0.5 ${isFocused ? 'text-hero-text' : 'text-hero-muted'}`}
                >
                  {routeConfig.label}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
