import { router } from 'expo-router';
import React, { useMemo } from 'react';
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
  const { data: bikes, isLoading } = useBikes();

  const bikeCount = bikes?.length ?? 0;

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
      <SafeScreen scrollable>
        <Skeleton height={20} className="rounded-md mb-2 w-24" />
        <Skeleton height={36} className="rounded-md mb-2 w-40" />
        <Skeleton height={16} className="rounded-md mb-8 w-48" />
        <Skeleton height={320} className="rounded-3xl mb-6" />
        <Skeleton height={320} className="rounded-3xl mb-6" />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title="My Garage"
        subtitle={`Your Fleet \u2022 ${bikeCount} Machine${bikeCount !== 1 ? 's' : ''}`}
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
                imageUri={bike.imageUrl ?? undefined}
                status={status}
                mileage={{ value: mileage, unit: 'km' }}
                onPress={() => router.push(`/(tabs)/garage/${bike.id}` as any)}
              />
            );
          })}
        </View>
      )}

      {/* Add machine */}
      <View className="mb-8">
        {bikes && bikes.length > 0 ? (
          <TouchableOpacity
            className="border-2 border-dashed border-sand/40 rounded-2xl px-md py-md flex-row items-center gap-sm active:border-yellow"
            onPress={() => router.push('/(tabs)/garage/add' as any)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add another machine"
          >
            <View className="w-8 h-8 rounded-full bg-sand/10 items-center justify-center">
              <MaterialCommunityIcons name="plus" size={20} color={colors.sand} />
            </View>
            <Text className="font-sans-bold text-sm text-sand">Add another machine</Text>
          </TouchableOpacity>
        ) : (
          <EmptyState
            title="Expand Your Fleet"
            actionLabel="Add a Machine"
            description="Add a machine to your garage"
            onAction={() => router.push('/(tabs)/garage/add' as any)}
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
