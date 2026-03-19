import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BikeCard } from '../../../components/bike/bike-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { Skeleton } from '../../../components/ui/skeleton';
import { useBikes } from '../../../lib/api/use-bikes';

export default function GarageScreen() {
  const { data: bikes, isLoading } = useBikes();

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title="Garage"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/garage/add' as any)}
            className="bg-hero rounded-full px-md py-sm"
            activeOpacity={0.8}
          >
            <Text className="text-xs font-sans-semibold text-hero-text">+ Add bike</Text>
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View>
          <Skeleton height={72} className="rounded-lg mb-sm" />
          <Skeleton height={72} className="rounded-lg mb-sm" />
          <Skeleton height={72} className="rounded-lg mb-sm" />
        </View>
      ) : !bikes || bikes.length === 0 ? (
        <EmptyState
          title="No bikes yet"
          description="Add your first bike to get started"
          actionLabel="Add bike"
          onAction={() => router.push('/(tabs)/garage/add' as any)}
        />
      ) : (
        bikes.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            onPress={() => router.push(`/(tabs)/garage/${bike.id}` as any)}
          />
        ))
      )}
    </SafeScreen>
  );
}
