import React from 'react';
import { Text, View } from 'react-native';
import { ListCard } from '../ui/list-card';
import type { Bike } from '../../lib/types/bike';

const CLASS_LABELS: Record<string, string> = {
  '2B': 'Class 2B (200cc & below)',
  '2A': 'Class 2A (201–400cc)',
  '2': 'Class 2 (401cc & above)',
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Text className="text-xs font-sans-medium text-muted uppercase tracking-widest">{label}</Text>
      <Text className="text-sm font-sans text-charcoal">{value}</Text>
    </View>
  );
}

interface BikeDetailsCardProps {
  bike: Bike;
}

export function BikeDetailsCard({ bike }: BikeDetailsCardProps) {
  return (
    <ListCard>
      <DetailRow label="Model" value={bike.model} />
      <View className="h-px bg-outline" />
      <DetailRow label="Year" value={String(bike.year)} />
      <View className="h-px bg-outline" />
      <DetailRow label="Class" value={CLASS_LABELS[bike.class] ?? bike.class} />
      <View className="h-px bg-outline" />
      <DetailRow label="Plate" value={bike.plateNumber} />
    </ListCard>
  );
}
