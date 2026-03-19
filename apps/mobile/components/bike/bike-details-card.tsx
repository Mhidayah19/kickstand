import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';
import { ListCard } from '../ui/list-card';
import { Bike } from '../../lib/types/bike';

const CLASS_LABELS: Record<string, string> = {
  '2B': 'Class 2B',
  '2A': 'Class 2A',
  '2': 'Class 2 (Full)',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-sm">
      <Text className="text-sm font-sans text-text-muted">{label}</Text>
      <Text className="text-sm font-sans-medium text-text-primary">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border-subtle" />;
}

interface BikeDetailsCardProps {
  bike: Bike;
}

export function BikeDetailsCard({ bike }: BikeDetailsCardProps) {
  return (
    <ListCard>
      <InfoRow label="Model" value={bike.model} />
      <Divider />
      <InfoRow label="Year" value={String(bike.year)} />
      <Divider />
      <InfoRow label="Class" value={CLASS_LABELS[bike.class] ?? bike.class} />
      <Divider />
      <InfoRow label="Plate" value={bike.plateNumber} />
    </ListCard>
  );
}
