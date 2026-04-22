import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';

export interface TopBarProps {
  bike: string;
  unread: number;
  onBikePress?: () => void;
  onBellPress?: () => void;
}

export function TopBar({ bike, unread, onBikePress, onBellPress }: TopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
      intensity={80}
      tint="light"
      style={{ paddingTop: insets.top + 4 }}
      className="px-5 pb-[14px] flex-row items-center justify-between border-b border-hairline"
    >
      <Pressable
        onPress={onBikePress}
        className="flex-row items-center gap-2 py-1.5 px-2.5 rounded-[10px] border border-hairline-2"
      >
        <Icon name="bike" size={16} stroke="#1A1A1A" />
        <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink">{bike}</Text>
        <Icon name="chevronDown" size={12} stroke="#1A1A1A" />
      </Pressable>
      <Text className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">
        KCKSTND · 01
      </Text>
      <Pressable
        testID="topbar-bell"
        onPress={onBellPress}
        className="w-9 h-9 items-center justify-center rounded-[10px] border border-hairline-2 relative"
      >
        <Icon name="bell" size={16} stroke="#1A1A1A" />
        {unread > 0 ? (
          <View
            testID="unread-dot"
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow"
          />
        ) : null}
      </Pressable>
    </BlurView>
  );
}
