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
    return <>Never serviced · Now <Text className="text-charcoal">{formatNumber(item.currentMileage)}</Text></>;
  }
  if (item.status === 'overdue' && item.deltaKm != null && item.deltaKm < 0) {
    return (
      <>
        Last <Text className="text-charcoal">{formatNumber(item.lastMileage)}</Text> · Now{' '}
        <Text className="text-charcoal">{formatNumber(item.currentMileage)}</Text> ·{' '}
        <Text className="text-charcoal">+{formatNumber(-item.deltaKm)} KM</Text>
      </>
    );
  }
  if (item.status === 'approaching' && item.deltaKm != null) {
    return (
      <>
        Last <Text className="text-charcoal">{formatNumber(item.lastMileage)}</Text> ·{' '}
        <Text className="text-charcoal">{formatNumber(item.deltaKm)} KM</Text> away
      </>
    );
  }
  return <>Last <Text className="text-charcoal">{formatNumber(item.lastMileage)}</Text></>;
}

function complianceMeta(item: Extract<AttentionItem, { category: 'compliance' }>): React.ReactNode {
  const abs = Math.abs(item.daysRemaining);
  const dayLabel = abs === 1 ? 'DAY' : 'DAYS';
  const suffix = item.daysRemaining < 0 ? ' AGO' : '';
  return (
    <>
      {item.expiresAt} · <Text className="text-charcoal">{abs} {dayLabel}{suffix}</Text>
    </>
  );
}

function pillLabel(item: AttentionItem): string {
  if (item.status === 'overdue') {
    return item.category === 'compliance' ? 'Expired' : 'Overdue';
  }
  if (item.status === 'approaching') {
    return item.category === 'compliance' ? 'Expiring' : 'Due Soon';
  }
  return 'OK';
}

export function AttentionRow({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-2xl px-5 py-4 mb-2 active:opacity-70"
    >
      <View className="flex-row items-start justify-between mb-1.5">
        <View className="flex-row items-center gap-2 flex-1">
          <AttentionStatusDot status={item.status} />
          <Text className="font-sans-xbold text-base text-charcoal">{item.label}</Text>
        </View>
        <AttentionPillBadge status={item.status} label={pillLabel(item)} />
      </View>
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 ml-3.5">
        {item.category === 'maintenance' ? maintenanceMeta(item) : complianceMeta(item)}
      </Text>
    </Pressable>
  );
}
