import React from 'react';
import { View, Text } from 'react-native';

export type BadgeTone = 'danger' | 'accent' | 'ink' | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  testID?: string;
}

const toneStyles: Record<BadgeTone, { bg: string; text: string }> = {
  danger:  { bg: 'bg-danger-surface',                    text: 'text-danger' },
  accent:  { bg: 'bg-yellow/20',                         text: 'text-yellow' },
  ink:     { bg: 'bg-ink',                               text: 'text-bg' },
  neutral: { bg: 'bg-hairline',                          text: 'text-ink-2' },
};

export function Badge({ tone = 'neutral', children, testID }: BadgeProps) {
  const s = toneStyles[tone];
  return (
    <View
      testID={testID}
      className={`${s.bg} ${s.text} rounded-full px-2 py-1 self-start`}
    >
      <Text className={`${s.text} font-mono text-[9px] tracking-[0.14em] uppercase`}>
        {children}
      </Text>
    </View>
  );
}
