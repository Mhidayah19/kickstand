import React from 'react';
import { View, Text } from 'react-native';
import { Eyebrow } from '../ui/atelier';
import type { AttentionItem, AttentionStatus } from '../../lib/types/attention';

const STATUS_COLOR: Record<AttentionStatus, string> = {
  overdue: 'text-danger',
  approaching: 'text-ink',
  ok: 'text-success',
};

const STATUS_LABEL: Record<AttentionStatus, string> = {
  overdue: 'Overdue',
  approaching: 'Approaching',
  ok: 'On track',
};

function maintenanceDelta(item: Extract<AttentionItem, { category: 'maintenance' }>) {
  if (item.status === 'overdue' && item.deltaKm != null && item.deltaKm < 0) {
    return { num: Math.abs(item.deltaKm).toLocaleString('en-SG'), unit: 'KM OVER' };
  }
  if (item.status === 'approaching' && item.deltaKm != null) {
    return { num: item.deltaKm.toLocaleString('en-SG'), unit: 'KM AWAY' };
  }
  if (item.deltaMonths != null) {
    const abs = Math.abs(item.deltaMonths);
    return { num: abs.toString(), unit: abs === 1 ? 'MONTH' : 'MONTHS' };
  }
  return { num: '0', unit: 'KM' };
}

function complianceDelta(item: Extract<AttentionItem, { category: 'compliance' }>) {
  const abs = Math.abs(item.daysRemaining);
  return { num: abs.toString(), unit: abs === 1 ? 'DAY' : 'DAYS' };
}

export function AttentionDetailHero({ item }: { item: AttentionItem }) {
  const { num, unit } = item.category === 'maintenance'
    ? maintenanceDelta(item)
    : complianceDelta(item);

  const caption = item.category === 'maintenance'
    ? (item.intervalKm
        ? `Past your ${item.intervalKm.toLocaleString('en-SG')} km interval.`
        : item.intervalMonths
          ? `Service every ${item.intervalMonths} months.`
          : '')
    : `Due before ${item.expiresAt}.`;

  return (
    <View className="mb-8">
      <Eyebrow className={`mb-3 ${STATUS_COLOR[item.status]}`}>
        {STATUS_LABEL[item.status]}
      </Eyebrow>
      <Text
        className="font-display text-ink leading-[1.02] tracking-[-0.03em] mb-4"
        style={{ fontSize: 36 }}
      >
        {item.label}
      </Text>
      <View className="flex-row items-baseline gap-2 mb-2">
        <Text
          className={`font-display ${item.status === 'overdue' ? 'text-danger' : 'text-ink'}`}
          style={{ fontSize: 48, lineHeight: 56, letterSpacing: -2.2 }}
        >
          {num}
        </Text>
        <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">{unit}</Text>
      </View>
      {caption ? (
        <Text className="font-sans text-[13px] text-muted leading-[20px]">{caption}</Text>
      ) : null}
    </View>
  );
}
