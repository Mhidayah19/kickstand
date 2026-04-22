import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';

export type TabId = 'home' | 'garage' | 'service' | 'profile';

export interface TabBarProps {
  active: TabId;
  onChange: (id: TabId) => void;
  onAdd: () => void;
}

const tabs: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'home',    icon: 'home',      label: 'Home' },
  { id: 'garage',  icon: 'bike',      label: 'Bike' },
  { id: 'service', icon: 'clipboard', label: 'Log' },
  { id: 'profile', icon: 'profile',   label: 'Profile' },
];

export function TabBar({ active, onChange, onAdd }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute left-[14px] right-[14px] flex-row gap-2.5 items-center"
      style={{ bottom: insets.bottom + 18 }}
    >
      <View
        className="flex-1 h-16 bg-ink rounded-[22px]"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.3,
          shadowRadius: 24,
          elevation: 16,
        }}
      >
        <View className="flex-1 flex-row items-center">
          {tabs.map((t) => {
            const isActive = active === t.id;
            return (
              <Pressable
                key={t.id}
                testID={`tab-${t.id}`}
                onPress={() => onChange(t.id)}
                className="flex-1 items-center gap-[3px] py-1.5"
              >
                <Icon name={t.icon} size={18} stroke={isActive ? '#F4F2EC' : 'rgba(244,242,236,0.4)'} />
                <Text
                  className="font-mono text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: isActive ? '#F4F2EC' : 'rgba(244,242,236,0.4)' }}
                >
                  {t.label}
                </Text>
                <View
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: isActive ? '#F2D06B' : 'transparent' }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
      <Pressable
        testID="tab-fab"
        onPress={onAdd}
        className="w-16 h-16 rounded-full items-center justify-center bg-yellow"
        style={{
          shadowColor: '#F2D06B',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.55,
          shadowRadius: 28,
          elevation: 12,
        }}
      >
        <Icon name="plus" size={26} stroke="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </View>
  );
}
