import React from 'react';
import { View } from 'react-native';
import type { AttentionStatus } from '../../lib/types/attention';

interface Props {
  progress: number;
  status: AttentionStatus;
}

const FILL: Record<AttentionStatus, string> = {
  overdue: 'bg-danger',
  approaching: 'bg-yellow',
  ok: 'bg-success',
};

export function AttentionProgressBar({ progress, status }: Props) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View className="mb-7">
      <View className="bg-surface-low rounded-full h-1.5 overflow-hidden">
        <View
          className={`h-full rounded-full ${FILL[status]}`}
          style={{ width: `${pct}%` }}
        />
      </View>
    </View>
  );
}
