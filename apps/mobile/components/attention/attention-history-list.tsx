import React from 'react';
import { View, Text } from 'react-native';
import type { ServiceLog } from '../../lib/types/service-log';

interface Props {
  logs: ServiceLog[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-SG', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function AttentionHistoryList({ logs }: Props) {
  if (logs.length === 0) return null;
  return (
    <View className="mb-8">
      <Text className="font-sans-bold text-xxs text-muted uppercase tracking-widest mb-3.5">
        Service History
      </Text>
      {logs.slice(0, 5).map((log) => (
        <View
          key={log.id}
          className="flex-row items-center justify-between py-3"
        >
          <Text className="font-sans-bold text-sm text-ink">{formatDate(log.date)}</Text>
          <Text className="font-sans-medium text-xs text-muted">
            {log.mileageAt.toLocaleString('en-SG')} km · ${parseFloat(log.cost).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}
