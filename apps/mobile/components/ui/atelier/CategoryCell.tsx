import React from 'react';
import { Pressable, Text } from 'react-native';
import { Icon, IconName } from './Icon';

export interface CategoryCellProps {
  icon: IconName;
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function CategoryCell({ icon, label, active = false, onPress }: CategoryCellProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`aspect-square rounded-2xl items-center justify-center gap-2 px-1 py-3 border ${
        active ? 'bg-ink border-ink' : 'bg-transparent border-hairline-2'
      }`}
    >
      <Icon name={icon} size={22} stroke={active ? '#F4F2EC' : '#1A1A1A'} />
      <Text
        className={`font-sans-semibold text-[11px] tracking-[-0.01em] ${active ? 'text-bg' : 'text-ink'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
