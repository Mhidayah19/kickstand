import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { EmptyState } from '../../../components/ui/empty-state';
import { Skeleton } from '../../../components/ui/skeleton';
import { BikeCard } from '../../../components/bike/bike-card';
import { useBikes } from '../../../lib/api/use-bikes';

export default function GarageScreen() {
  const { data: bikes, isLoading } = useBikes();

  const renderRight = (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/garage/add')}
      className="bg-hero px-md py-xs rounded-full"
    >
      <Text className="text-hero-text text-xs font-sans-semibold">+ Add bike</Text>
    </TouchableOpacity>
  );

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Garage" rightAction={renderRight} />

      {isLoading ? (
        <View className="gap-sm">
          <Skeleton height={72} rounded={false} />
          <Skeleton height={72} rounded={false} />
          <Skeleton height={72} rounded={false} />
        </View>
      ) : !bikes || bikes.length === 0 ? (
        <EmptyState
          title="No bikes yet"
          description="Add your first bike to get started"
          actionLabel="Add bike"
          onAction={() => router.push('/(tabs)/garage/add')}
        />
      ) : (
        bikes.map((bike) => (
          <BikeCard
            key={bike.id}
            bike={bike}
            onPress={() => router.push(`/(tabs)/garage/${bike.id}`)}
          />
        ))
      )}
    </SafeScreen>
  );
}
