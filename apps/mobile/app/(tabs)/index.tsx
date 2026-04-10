import { router } from 'expo-router';
import React, { useMemo, useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { SafeScreen } from '../../components/ui/safe-screen';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { Section } from '../../components/ui/section';
import { ListCard } from '../../components/ui/list-card';
import { DismissibleCallout } from '../../components/ui/dismissible-callout';
import { DevAuthToggle } from '../../components/dev/DevAuthToggle';

import { HeroPedestal } from '../../components/prediction/hero-pedestal';
import { CountdownDisplay } from '../../components/prediction/countdown-display';
import { ConfidenceBadge } from '../../components/prediction/confidence-badge';
import { PaceGraph } from '../../components/prediction/pace-graph';
import { UpcomingServiceCard } from '../../components/prediction/upcoming-service-card';
import { CategoryBar } from '../../components/prediction/category-bar';

import { useBikes } from '../../lib/api/use-bikes';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { computeNextService } from '../../lib/prediction/compute-next-service';
import { getActiveSeasonalCallout } from '../../lib/seasonal';
import { serviceTypeToMeta } from '../../lib/service-type-meta';
import { daysAgo, formatDaysAgo } from '../../lib/format';
import { colors } from '../../lib/colors';

export default function HomeScreen() {
  const { data: bikes, isLoading } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const [monsoonDismissed, setMonsoonDismissed] = useState(false);

  const activeBike = useMemo(() => {
    if (!bikes || bikes.length === 0) return null;
    return bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  }, [bikes, activeBikeId]);

  const { data: serviceLogsData } = useServiceLogs(activeBike?.id ?? null, 3);
  const recentServices = serviceLogsData?.data ?? [];

  const lastService = recentServices[0];
  const prediction = useMemo(
    () =>
      computeNextService({
        currentMileage: activeBike?.currentMileage ?? 0,
        // TODO: add mileageAtService to ServiceLog type
        lastServiceMileage: (lastService as any)?.mileageAt ?? null,
        lastServiceDate: lastService ? new Date(lastService.date) : null,
      }),
    [activeBike, lastService],
  );

  // approximate "today" marker on the pace graph
  const idealProgress = useMemo(() => {
    if (!lastService || !activeBike) return 0.6; // fallback for empty state
    const intervalKm = 6000;
    const delta = activeBike.currentMileage - ((lastService as any).mileageAt ?? 0);
    return Math.min(1, Math.max(0, delta / intervalKm));
  }, [activeBike, lastService]);

  const callout = useMemo(() => getActiveSeasonalCallout(), []);

  const handleAddBike = useCallback(() => router.push('/add-bike'), []);
  // TODO: create /prediction route in batch 5
  const handlePrediction = useCallback(() => router.push('/prediction' as any), []);
  const handleServiceEntry = useCallback(() => router.push('/add-service'), []);

  // ────────────── Loading state ──────────────
  if (isLoading) {
    return (
      <SafeScreen
        scrollable
        bikes={bikes}
        activeBike={activeBike ?? undefined}
        onBikeChange={setActiveBikeId}
      >
        <Skeleton height={20} className="rounded-md mb-2 w-32" />
        <Skeleton height={36} className="rounded-md mb-8 w-48" />
        <Skeleton height={360} className="rounded-3xl mb-10" />
        <Skeleton height={140} className="rounded-3xl mb-10" />
        <Skeleton height={180} className="rounded-2xl mb-10" />
      </SafeScreen>
    );
  }

  // ────────────── Empty state ──────────────
  if (!activeBike) {
    return (
      <SafeScreen
        scrollable
        bikes={bikes}
        activeBike={undefined}
        onBikeChange={setActiveBikeId}
      >
        <DevAuthToggle>
          <Text className="text-[34px] font-sans-xbold text-charcoal leading-[1.05]">
            Welcome to Kickstand
          </Text>
        </DevAuthToggle>
        <View className="mt-8">
          <EmptyState
            title="No bikes yet"
            description="Add your first bike to start tracking services and stay road-ready"
            actionLabel="Add your first bike"
            onAction={() => router.push('/add-bike')}
          />
        </View>
      </SafeScreen>
    );
  }

  // ────────────── Main state ──────────────
  return (
    <SafeScreen
      scrollable
      bikes={bikes}
      activeBike={activeBike}
      onBikeChange={setActiveBikeId}
      onAddBikePress={handleAddBike}
    >
      {/* Hero pedestal with prediction countdown */}
      <View className="mb-8">
        <HeroPedestal onPress={handlePrediction}>
          <View className="px-8 pt-8 pb-4">
            <View className="flex-row items-start justify-between mb-6">
              <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-sand">
                Oil Change In
              </Text>
              <ConfidenceBadge level={prediction.confidence} />
            </View>
            <CountdownDisplay
              value={prediction.headline.value}
              unit={prediction.headline.unit}
              supporting={prediction.headline.supporting}
              size="xl"
              tone="surface"
            />
            <Text className="text-[11px] font-sans-medium text-surface/50 mt-2 max-w-[320px]">
              Based on your last 60 days of riding · Tap for details
            </Text>
          </View>
          <View className="px-8 pb-8 pt-2">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-sand">
                Pace vs Ideal
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-3 h-0.5 bg-yellow" />
                  <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-surface/70">
                    Ideal
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-3 h-0.5 bg-surface" />
                  <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-surface">
                    Actual
                  </Text>
                </View>
              </View>
            </View>
            <PaceGraph actualProgress={idealProgress} idealProgress={idealProgress} />
            <View className="flex-row justify-between mt-2">
              <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-surface/50">
                Last service
              </Text>
              <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-surface/50">
                Today
              </Text>
              <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-surface/50">
                Projected
              </Text>
            </View>
          </View>
        </HeroPedestal>
      </View>

      {/* Monsoon callout (seasonal, dismissible) */}
      {callout && !monsoonDismissed && (
        <DismissibleCallout
          eyebrow={callout.eyebrow}
          title={callout.title}
          body={callout.body}
          icon={callout.icon}
          primaryLabel="Log lubrication"
          onPrimary={handleServiceEntry}
          secondaryLabel="Read more"
          onSecondary={() => {}}
          onDismiss={() => setMonsoonDismissed(true)}
        />
      )}

      {/* Upcoming services carousel */}
      <Section eyebrow="NEXT UP" label="Upcoming services" action="View all" onAction={() => {}}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
          className="-mx-6 px-6"
        >
          <UpcomingServiceCard
            icon="oil"
            label="Engine Oil"
            value={prediction.headline.value}
            unit={prediction.headline.unit === 'KM' ? 'KM' : 'D'}
            supporting={prediction.headline.supporting.replace('— whichever comes first', '')}
            variant="dark"
            onPress={handlePrediction}
          />
          <UpcomingServiceCard
            icon="link-variant"
            label="Chain Lube"
            value="120"
            unit="KM"
            supporting="or 6 days"
            variant="light"
            onPress={handleServiceEntry}
          />
          <UpcomingServiceCard
            icon="tire"
            label="Tyre Check"
            value="2,110"
            unit="KM"
            supporting="or 42 days"
            variant="light"
          />
          <UpcomingServiceCard
            icon="car-brake-abs"
            label="Brake Pads"
            value="4,800"
            unit="KM"
            supporting="or 94 days"
            variant="light"
          />
        </ScrollView>
      </Section>

      {/* Cost breakdown summary (tap to drill) */}
      <Section eyebrow="LAST 12 MONTHS" label="Cost breakdown" action="View">
        <View className="bg-sand/10 rounded-2xl p-6">
          <CategoryBar
            icon="tire"
            label="Tyres"
            spent="S$ 860"
            spentRatio={0.82}
            sparkValues={[12, 10, 13, 6, 4]}
            // TODO: create /category/[slug] route in batch 6
            onPress={() => router.push('/category/tyres' as any)}
          />
          <CategoryBar
            icon="oil"
            label="Consumables"
            spent="S$ 640"
            projected="+ 180"
            spentRatio={0.61}
            projectedRatio={0.17}
            sparkValues={[6, 8, 5, 10, 9]}
          />
          <CategoryBar
            icon="wrench"
            label="Repair"
            spent="S$ 520"
            spentRatio={0.5}
            sparkValues={[13, 11, 9, 4, 2]}
            barColor="yellow"
          />
          <CategoryBar
            icon="tune"
            label="Modifications"
            spent="S$ 240"
            spentRatio={0.23}
            sparkValues={[9, 10, 8, 9, 7]}
          />
          <CategoryBar
            icon="shield-check"
            label="Compliance"
            spent="S$ 80"
            spentRatio={0.08}
            sparkValues={[8, 8, 8, 8, 8]}
          />
        </View>
      </Section>

      {/* Recent services */}
      <Section eyebrow="HISTORY" label="Recent services" action="View log" onAction={() => router.push('/(tabs)/service')}>
        <View className="bg-sand/10 rounded-2xl p-2">
          {recentServices.length === 0 ? (
            <Text className="text-sm font-sans-medium text-charcoal/55 py-4 text-center">
              Nothing logged yet — tap + to add a service.
            </Text>
          ) : (
            recentServices.map((log) => {
              const meta = serviceTypeToMeta(log.serviceType);
              const agoText = formatDaysAgo(daysAgo(log.date));
              const cost = parseFloat(log.cost);
              return (
                <ListCard
                  key={log.id}
                  icon={meta.icon}
                  iconBg={meta.iconBg}
                  iconColor={meta.iconColor}
                  title={meta.label}
                  subtitle={agoText}
                  trailing={!isNaN(cost) ? `S$${cost.toFixed(0)}` : undefined}
                />
              );
            })
          )}
        </View>
      </Section>

    </SafeScreen>
  );
}
