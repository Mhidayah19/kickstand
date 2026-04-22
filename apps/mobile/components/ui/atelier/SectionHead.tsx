import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Eyebrow } from './Eyebrow';

export interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  action?: string;
  onActionPress?: () => void;
}

export function SectionHead({ eyebrow, title, action, onActionPress }: SectionHeadProps) {
  return (
    <View className="flex-row items-baseline justify-between mb-[14px]">
      <View>
        {eyebrow ? <Eyebrow className="mb-0.5">{eyebrow}</Eyebrow> : null}
        <Text className="text-ink font-sans-semibold text-[13px] tracking-[-0.01em]">{title}</Text>
      </View>
      {action ? (
        <Pressable onPress={onActionPress}>
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
            {action} →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
