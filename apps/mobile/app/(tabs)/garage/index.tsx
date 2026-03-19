import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { Skeleton } from '../../../components/ui/skeleton';

const motorcycleImage = require('../../../assets/images/motorcycle.png');
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
        <View className="flex-1 items-center justify-center">
          <Image
            source={motorcycleImage}
            style={{ width: 120, height: 120, marginBottom: 16 }}
            resizeMode="contain"
          />
          <Text className="text-base font-sans-bold text-text-primary text-center mb-sm">No bikes yet</Text>
          <Text className="text-sm font-sans text-text-muted text-center mb-xl">Add your first bike to get started</Text>
          <TouchableOpacity
            className="bg-hero px-xl py-md rounded-full"
            onPress={() => router.push('/(tabs)/garage/add')}
            activeOpacity={0.8}
          >
            <Text className="text-hero-text font-sans-semibold text-sm">Add bike</Text>
          </TouchableOpacity>
        </View>
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
