import { router } from 'expo-router';
import React, { useMemo, useCallback } from 'react';
import { Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { EmptyState } from '../../components/ui/empty-state';
import { HeroCard } from '../../components/ui/hero-card';
import { ListCard } from '../../components/ui/list-card';
import { ProgressBar } from '../../components/ui/progress-bar';
import { DevAuthToggle } from '../../components/dev/DevAuthToggle';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { Section } from '../../components/ui/section';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusCard } from '../../components/ui/status-card';
import { useBikes } from '../../lib/api/use-bikes';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { colors } from '../../lib/colors';
import { getComplianceStatus } from '../../lib/theme';

export default function HomeScreen() {
  const { data: bikes, isLoading } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();

  const activeBike = useMemo(() => {
    if (!bikes || bikes.length === 0) return null;
    return bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  }, [bikes, activeBikeId]);

  const { data: serviceLogsData } = useServiceLogs(activeBike?.id ?? null, 3);
  const recentServices = serviceLogsData?.data ?? [];

  // Compute mileage progress toward next service (every 5,000 km)
  const mileage = activeBike?.currentMileage ?? 0;
  const serviceInterval = 5000;
  const nextServiceAt = Math.ceil(mileage / serviceInterval) * serviceInterval || serviceInterval;
  const mileageProgress = mileage > 0 ? Math.round((mileage / nextServiceAt) * 100) : 0;
  const kmUntilService = nextServiceAt - mileage;

  const inspectionStatus = useMemo(
    () => getComplianceStatus(activeBike?.inspectionDue ?? null),
    [activeBike],
  );

  const roadTaxStatus = useMemo(
    () => getComplianceStatus(activeBike?.roadTaxExpiry ?? null),
    [activeBike],
  );

  const handleAddBike = useCallback(() => {
    router.push('/add-bike');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SafeScreen
        scrollable
        bikes={bikes}
        activeBike={activeBike ?? undefined}
        onBikeChange={setActiveBikeId}
        onFeedbackPress={() => Sentry.showFeedbackWidget()}
        onAddBikePress={handleAddBike}
      >
        <Skeleton height={20} className="rounded-md mb-2 w-32" />
        <Skeleton height={36} className="rounded-md mb-8 w-48" />
        <Skeleton height={200} className="rounded-3xl mb-6" />
        <View className="flex-row gap-4 mb-6">
          <Skeleton height={160} className="rounded-3xl flex-1" />
          <Skeleton height={160} className="rounded-3xl flex-1" />
        </View>
        <Skeleton height={24} className="rounded-md mb-4 w-40" />
        <Skeleton height={72} className="rounded-2xl mb-3" />
        <Skeleton height={72} className="rounded-2xl mb-3" />
      </SafeScreen>
    );
  }

  // Empty state
  if (!activeBike) {
    return (
      <SafeScreen
        scrollable
        bikes={bikes}
        activeBike={undefined}
        onBikeChange={setActiveBikeId}
        onFeedbackPress={() => Sentry.showFeedbackWidget()}
      >
        <DevAuthToggle>
          <ScreenHeader label="DASHBOARD OVERVIEW" title="Welcome back!" />
        </DevAuthToggle>
        <EmptyState
          title="No bikes yet"
          description="Add your first bike to start tracking mileage and compliance"
          actionLabel="Add your first bike"
          onAction={() => router.push('/add-bike')}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen
      scrollable
      bikes={bikes}
      activeBike={activeBike ?? undefined}
      onBikeChange={setActiveBikeId}
      onFeedbackPress={() => Sentry.showFeedbackWidget()}
      onAddBikePress={handleAddBike}
    >
      <DevAuthToggle>
        <ScreenHeader label="DASHBOARD OVERVIEW" title="Welcome back!" />
      </DevAuthToggle>

      {/* Mileage Hero Card */}
      <HeroCard>
        {/* Decorative circle */}
        <View
          className="absolute bg-yellow/10 rounded-full"
          style={{ width: 192, height: 192, top: -40, right: -40 }}
        />
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest mb-3">
          Total Distance
        </Text>
        <View className="flex-row items-baseline">
          <Text className="text-5xl font-sans-xbold text-white tracking-tighter">
            {mileage.toLocaleString()}
          </Text>
          <Text className="text-xl font-sans-bold text-sand ml-2">KM</Text>
        </View>
        <View className="mt-5">
          <ProgressBar
            value={mileageProgress}
            color="yellow"
            size="md"
          />
        </View>
        <Text className="text-xs font-sans-medium text-sand/70 mt-3">
          {kmUntilService.toLocaleString()} km until next service at {nextServiceAt.toLocaleString()} km
        </Text>
      </HeroCard>

      {/* Compliance Grid */}
      <View className="flex-row gap-4 mb-6">
        <StatusCard
          icon="clipboard-check-outline"
          iconColor={colors.charcoal}
          title={'Inspection'}
          status={inspectionStatus.status}
          statusVariant={inspectionStatus.variant}
          bgClass="bg-sand/30"
        />
        <StatusCard
          icon="file-document-outline"
          iconColor={colors.charcoal}
          title={'Road\nTax'}
          status={roadTaxStatus.status}
          statusVariant={roadTaxStatus.variant}
          bgClass="bg-surface-low"
        />
      </View>

      {/* Recent Services */}
      <Section label="Recent Services" action="View All" onAction={() => router.push('/(tabs)/service')}>
        <View className="gap-3">
          {recentServices.length === 0 ? (
            <Text className="text-sm font-sans-medium text-sand/60 py-4 text-center">
              No service logs yet
            </Text>
          ) : (
            recentServices.map((log) => (
              <ListCard
                key={log.id}
                icon="wrench"
                iconBg="bg-sand/20"
                iconColor={colors.sand}
                title={log.serviceType}
                subtitle={new Date(log.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            ))
          )}
        </View>
      </Section>
    </SafeScreen>
  );
}
