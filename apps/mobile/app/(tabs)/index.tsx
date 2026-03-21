import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { EmptyState } from '../../components/ui/empty-state';
import { HeroCard } from '../../components/ui/hero-card';
import { ListCard } from '../../components/ui/list-card';
import { PillBadge } from '../../components/ui/pill-badge';
import { ProgressBar } from '../../components/ui/progress-bar';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { Section } from '../../components/ui/section';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusCard } from '../../components/ui/status-card';
import { useBikes } from '../../lib/api/use-bikes';
import { useBikeStore } from '../../lib/store/bike-store';
import { daysUntil, getComplianceVariant } from '../../lib/theme';

export default function HomeScreen() {
  const { data: bikes, isLoading } = useBikes();
  const { activeBikeId } = useBikeStore();

  const activeBike = useMemo(() => {
    if (!bikes || bikes.length === 0) return null;
    return bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  }, [bikes, activeBikeId]);

  // Compute mileage progress toward next service (every 5,000 km)
  const mileage = activeBike?.currentMileage ?? 0;
  const serviceInterval = 5000;
  const nextServiceAt = Math.ceil(mileage / serviceInterval) * serviceInterval || serviceInterval;
  const mileageProgress = mileage > 0 ? Math.round((mileage / nextServiceAt) * 100) : 0;
  const kmUntilService = nextServiceAt - mileage;

  // Compute compliance status
  const tireStatus = useMemo(() => {
    if (!activeBike) return { status: 'Good', variant: 'surface' as const };
    const inspDays = daysUntil(activeBike.inspectionDue);
    const variant = getComplianceVariant(inspDays);
    if (variant === 'expired' || variant === 'danger') return { status: 'Warning', variant: 'danger' as const };
    return { status: 'Good', variant: 'surface' as const };
  }, [activeBike]);

  const oilStatus = useMemo(() => {
    if (!activeBike) return { status: 'Good', variant: 'surface' as const };
    const rtDays = daysUntil(activeBike.roadTaxExpiry);
    const variant = getComplianceVariant(rtDays);
    if (variant === 'expired' || variant === 'danger') return { status: 'Warning', variant: 'danger' as const };
    return { status: 'Good', variant: 'surface' as const };
  }, [activeBike]);

  // Loading state
  if (isLoading) {
    return (
      <SafeScreen scrollable>
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
      <SafeScreen scrollable>
        <ScreenHeader label="DASHBOARD OVERVIEW" title="Welcome back!" />
        <EmptyState
          title="No bikes yet"
          description="Add your first bike to start tracking mileage and compliance"
          actionLabel="Add your first bike"
          onAction={() => router.push('/(tabs)/garage/add' as any)}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <ScreenHeader label="DASHBOARD OVERVIEW" title="Welcome back!" />

      {/* Mileage Hero Card */}
      <HeroCard>
        {/* Decorative circle */}
        <View
          className="absolute bg-yellow/10 rounded-full"
          style={{ width: 192, height: 192, top: -40, right: -40 }}
        />
        <Text className="text-xs font-sans-bold text-yellow uppercase tracking-widest mb-3">
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
          icon="tire"
          iconColor="#F2D06B"
          title={'Tire\nPressure'}
          status={tireStatus.status}
          statusVariant={tireStatus.variant}
          bgClass="bg-sand/30"
        />
        <StatusCard
          icon="oil"
          iconColor="#DC2626"
          title={'Oil\nLife'}
          status={oilStatus.status}
          statusVariant={oilStatus.variant}
          bgClass="bg-surface-low"
        />
      </View>

      {/* Recent Services */}
      <Section label="Recent Services" action="View All" onAction={() => {}}>
        <View className="gap-3">
          <ListCard
            icon="wrench"
            iconBg="bg-sand/20"
            iconColor="#C7B299"
            title="Oil Change"
            subtitle="12 Mar 2026"
          />
          <ListCard
            icon="tire"
            iconBg="bg-yellow/20"
            iconColor="#F2D06B"
            title="Tire Rotation"
            subtitle="28 Feb 2026"
          />
          <ListCard
            icon="engine"
            iconBg="bg-surface-low"
            iconColor="#1E1E1E"
            title="Chain Adjustment"
            subtitle="15 Feb 2026"
          />
        </View>
      </Section>

      {/* Precision Badge */}
      <View className="bg-charcoal rounded-3xl p-6 items-center mb-2">
        <Text className="font-sans-bold text-xs text-sand/60 uppercase tracking-widest mb-2">
          Precision Atelier
        </Text>
        <Text className="font-sans-xbold text-lg text-white text-center mb-3">
          Every detail, dialed in.
        </Text>
        <PillBadge label={`ID: ${activeBike.plateNumber}`} variant="surface" />
      </View>
    </SafeScreen>
  );
}
