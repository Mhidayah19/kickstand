import React from 'react';
import { Text, View } from 'react-native';
import { ListCard } from '../ui/list-card';
import { MetricDisplay } from '../ui/metric-display';
import type { Bike } from '../../lib/types/bike';

interface BikeCardProps {
  bike: Bike;
  onPress: () => void;
}

export function BikeCard({ bike, onPress }: BikeCardProps) {
  return (
    <ListCard onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-text-primary">{bike.model}</Text>
          <Text className="text-xs font-sans text-muted mt-0.5">
            {bike.plateNumber} · {bike.year}
          </Text>
        </View>
        <MetricDisplay
          value={bike.currentMileage.toLocaleString()}
          unit="km"
          size="m"
        />
      </View>
    </ListCard>
  );
}
