import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AttentionStatusDot } from './attention-status-dot';
import { AttentionPillBadge } from './attention-pill-badge';
import type { AttentionItem } from '../../lib/types/attention';

interface Props {
  item: AttentionItem;
  onPress: () => void;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-SG');
}

function maintenanceMeta(item: Extract<AttentionItem, { category: 'maintenance' }>): React.ReactNode {
  if (item.lastMileage == null) {
    return <>Never serviced · Now <Text className="text-ink">{formatNumber(item.currentMileage)}</Text> km</>;
  }
  if (item.status === 'overdue' && item.deltaKm != null && item.deltaKm < 0) {
    return (
      <>
        {formatNumber(item.lastMileage)} km last ·{' '}
        <Text className="text-ink">+{formatNumber(-item.deltaKm)} km over</Text>
      </>
    );
  }
  if (item.status === 'approaching' && item.deltaKm != null) {
    return (
      <>
        {formatNumber(item.lastMileage)} km last ·{' '}
        <Text className="text-ink">{formatNumber(item.deltaKm)} km away</Text>
      </>
    );
  }
  return <>Last at {formatNumber(item.lastMileage)} km</>;
}

function complianceMeta(item: Extract<AttentionItem, { category: 'compliance' }>): React.ReactNode {
  const abs = Math.abs(item.daysRemaining);
  const suffix = item.daysRemaining < 0 ? ' ago' : '';
  return (
    <>
      {item.expiresAt} · <Text className="text-ink">{abs}d{suffix}</Text>
    </>
  );
}

function pillLabel(item: AttentionItem): string {
  if (item.status === 'overdue') return item.category === 'compliance' ? 'Expired' : 'Overdue';
  if (item.status === 'approaching') return item.category === 'compliance' ? 'Expiring' : 'Due soon';
  return 'OK';
}

export function AttentionRow({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="py-3 active:opacity-60"
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-2.5 flex-1">
          <AttentionStatusDot status={item.status} />
          <Text className="font-sans-semibold text-[14px] text-ink flex-1">{item.label}</Text>
        </View>
        <AttentionPillBadge status={item.status} label={pillLabel(item)} />
      </View>
      <Text className="font-mono text-[10px] tracking-[0.06em] uppercase text-muted ml-[18px]">
        {item.category === 'maintenance' ? maintenanceMeta(item) : complianceMeta(item)}
      </Text>
    </Pressable>
  );
}
