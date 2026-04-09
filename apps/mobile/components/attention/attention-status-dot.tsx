import React from 'react';
import { View } from 'react-native';
import type { AttentionStatus } from '../../lib/types/attention';

const COLOR_BY_STATUS: Record<AttentionStatus, string> = {
  overdue: 'bg-danger',
  approaching: 'bg-yellow',
  ok: 'bg-success',
};

export function AttentionStatusDot({ status }: { status: AttentionStatus }) {
  return <View className={`w-1.5 h-1.5 rounded-full ${COLOR_BY_STATUS[status]}`} />;
}
