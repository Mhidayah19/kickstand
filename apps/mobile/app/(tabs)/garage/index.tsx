import { router } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BikeImageCard } from '../../../components/bike/bike-image-card';
import { EmptyState } from '../../../components/ui/empty-state';
import { colors } from '../../../lib/colors';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { Section } from '../../../components/ui/section';
import { Skeleton } from '../../../components/ui/skeleton';
import { useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { daysUntil, getComplianceVariant } from '../../../lib/theme';
import type { Bike } from '../../../lib/types/bike';

function getBikeStatus(bike: Bike): 'ready' | 'overdue' {
  const dates = [bike.inspectionDue, bike.roadTaxExpiry, bike.insuranceExpiry, bike.coeExpiry];
  for (const d of dates) {
    const days = daysUntil(d);
    const variant = getComplianceVariant(days);
    if (variant === 'expired' || variant === 'danger') return 'overdue';
  }
  return 'ready';
}

function parseMakeModel(model: string): { make: string; modelName: string } {
  const parts = model.trim().split(/\s+/);
  if (parts.length > 1) {
    return { make: parts[0], modelName: parts.slice(1).join(' ') };
  }
  return { make: 'Motorcycle', modelName: model };
}

export default function GarageScreen() {
  const { data: bikes = [], isLoading } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const activeBike = bikes?.find((b) => b.id === activeBikeId);

  const bikeCount = bikes?.length ?? 0;

  const handleAddBike = useCallback(() => {
    router.push('/add-bike');
  }, []);

  // Fleet integrity stats
  const fleetStats = useMemo(() => {
    if (!bikes || bikes.length === 0) return { active: 0, logs: 0, alerts: 0 };
    let alerts = 0;
    for (const bike of bikes) {
      const dates = [bike.inspectionDue, bike.roadTaxExpiry, bike.insuranceExpiry, bike.coeExpiry];
      for (const d of dates) {
        const days = daysUntil(d);
        const variant = getComplianceVariant(days);
        if (variant === 'expired' || variant === 'danger') alerts++;
      }
    }
    return { active: bikes.length, logs: 0, alerts };
  }, [bikes]);

  // Loading state
  if (isLoading) {
    return (
      <SafeScreen
        scrollable
        bikes={bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? []}
        activeBike={activeBike && { id: activeBike.id, model: activeBike.model, year: activeBike.year }}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      >
        <Skeleton height={20} className="rounded-md mb-2 w-24" />
        <Skeleton height={36} className="rounded-md mb-2 w-40" />
        <Skeleton height={16} className="rounded-md mb-8 w-48" />
        <Skeleton height={320} className="rounded-3xl mb-6" />
        <Skeleton height={320} className="rounded-3xl mb-6" />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen
      scrollable
      bikes={bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? []}
      activeBike={activeBike && { id: activeBike.id, model: activeBike.model, year: activeBike.year }}
      onBikeChange={setActiveBikeId}
      onAddBikePress={handleAddBike}
    >
      <ScreenHeader
        title="My Garage"
        subtitle={`Your Fleet \u2022 ${bikeCount} Motorcycle${bikeCount !== 1 ? 's' : ''}`}
      />

      {/* Bike list */}
      {bikes && bikes.length > 0 && (
        <View className="gap-6 mb-6">
          {bikes.map((bike) => {
            // Bikes with a catalog entry have separate make + model fields.
            // Legacy bikes (pre-catalog) store the full "Honda CB400X" in model.
            const { make: parsedMake, modelName: parsedModel } = parseMakeModel(bike.model);
            const make = bike.make ?? parsedMake;
            const model = bike.make ? bike.model : parsedModel;
            const status = getBikeStatus(bike);
            const mileage = bike.currentMileage;
            return (
              <BikeImageCard
                key={bike.id}
                make={make}
                model={model}
                status={status}
                mileage={{ value: mileage, unit: 'km' }}
                onPress={() => router.push({ pathname: '/(tabs)/garage/[id]', params: { id: bike.id } })}
              />
            );
          })}
        </View>
      )}

      {/* Add motorcycle */}
      <View className="mb-8">
        {bikes && bikes.length > 0 ? (
          <TouchableOpacity
            className="border-2 border-dashed border-sand/40 rounded-2xl px-md py-md flex-row items-center gap-sm active:border-yellow"
            onPress={() => router.push('/add-bike')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add another motorcycle"
          >
            <View className="w-8 h-8 rounded-full bg-sand/10 items-center justify-center">
              <MaterialCommunityIcons name="plus" size={20} color={colors.sand} />
            </View>
            <Text className="font-sans-bold text-sm text-sand">Add another motorcycle</Text>
          </TouchableOpacity>
        ) : (
          <EmptyState
            title="Expand Your Fleet"
            actionLabel="Add a Motorcycle"
            description="Add a motorcycle to your garage"
            onAction={() => router.push('/add-bike')}
          />
        )}
      </View>

      {/* Fleet Integrity Summary */}
      {bikes && bikes.length > 0 && (
        <Section label="Fleet Integrity">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-surface-card rounded-2xl p-5 items-center">
              <Text className="font-sans-xbold text-2xl text-charcoal">{fleetStats.active}</Text>
              <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mt-1">
                Active
              </Text>
            </View>
            <View className="flex-1 bg-surface-card rounded-2xl p-5 items-center">
              <Text className="font-sans-xbold text-2xl text-charcoal">{fleetStats.logs > 0 ? fleetStats.logs : '—'}</Text>
              <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mt-1">
                Logs
              </Text>
            </View>
            <View className="flex-1 bg-surface-card rounded-2xl p-5 items-center">
              <Text className="font-sans-xbold text-2xl text-danger">{fleetStats.alerts}</Text>
              <Text className="font-sans-bold text-xxs text-danger uppercase tracking-widest mt-1">
                Alerts
              </Text>
            </View>
          </View>
        </Section>
      )}
    </SafeScreen>
  );
}
