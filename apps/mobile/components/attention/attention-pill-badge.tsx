import React from 'react';
import { View, Text } from 'react-native';
import type { AttentionStatus } from '../../lib/types/attention';

interface Props {
  status: AttentionStatus;
  label: string;
}

const STYLE: Record<AttentionStatus, { bg: string; text: string }> = {
  overdue: { bg: 'bg-danger/10', text: 'text-danger' },
  approaching: { bg: 'bg-yellow', text: 'text-ink' },
  ok: { bg: 'bg-success/10', text: 'text-success' },
};

export function AttentionPillBadge({ status, label }: Props) {
  const style = STYLE[status];
  return (
    <View className={`rounded-full px-2 py-1 ${style.bg}`}>
      <Text className={`font-sans-xbold text-xxs uppercase tracking-widest ${style.text}`}>
        {label}
      </Text>
    </View>
  );
}
