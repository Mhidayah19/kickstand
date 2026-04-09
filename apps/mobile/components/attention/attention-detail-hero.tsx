import React from 'react';
import { View, Text } from 'react-native';
import type { AttentionItem, AttentionStatus } from '../../lib/types/attention';

const STATUS_COLOR: Record<AttentionStatus, string> = {
  overdue: 'text-danger',
  approaching: 'text-charcoal',
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
        ? `You're past your ${item.intervalKm.toLocaleString('en-SG')} km interval.`
        : item.intervalMonths
          ? `Service every ${item.intervalMonths} months.`
          : '')
    : `Due before ${item.expiresAt}.`;

  return (
    <View className="mb-8">
      <Text className={`font-sans-bold text-xxs uppercase tracking-widest mb-3 ${STATUS_COLOR[item.status]}`}>
        {STATUS_LABEL[item.status]}
      </Text>
      <Text
        className="font-sans-xbold text-charcoal mb-4"
        style={{ fontSize: 32, lineHeight: 36, letterSpacing: -0.8 }}
      >
        {item.label}
      </Text>
      <View className="flex-row items-baseline gap-2 mb-1">
        <Text
          className={`font-sans-xbold ${item.status === 'overdue' ? 'text-danger' : 'text-charcoal'}`}
          style={{ fontSize: 44, lineHeight: 44, letterSpacing: -1.5 }}
        >
          {num}
        </Text>
        <Text className="font-sans-bold text-sm text-sand uppercase tracking-wide-1">{unit}</Text>
      </View>
      {caption ? (
        <Text className="font-sans-medium text-xs text-sand">{caption}</Text>
      ) : null}
    </View>
  );
}
