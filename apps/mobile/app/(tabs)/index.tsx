import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { HeroCard } from '../../components/ui/hero-card';
import { MetricDisplay } from '../../components/ui/metric-display';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { Section } from '../../components/ui/section';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusCard } from '../../components/ui/status-card';
import { EmptyState } from '../../components/ui/empty-state';
import { useBikes } from '../../lib/api/use-bikes';
import { useBikeStore } from '../../lib/store/bike-store';
import { daysUntil, getComplianceVariant } from '../../lib/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { data: bikes, isLoading } = useBikes();
  const { activeBikeId } = useBikeStore();

  const activeBike = useMemo(() => {
    if (!bikes || bikes.length === 0) return null;
    return bikes.find((b) => b.id === activeBikeId) ?? bikes[0];
  }, [bikes, activeBikeId]);

  if (isLoading) {
    return (
      <SafeScreen scrollable>
        <Skeleton height={36} className="rounded-md mb-lg w-48" />
        <Skeleton height={120} className="rounded-2xl mb-lg" />
        <Skeleton height={200} className="rounded-xl mb-lg" />
      </SafeScreen>
    );
  }

  if (!activeBike) {
    return (
      <SafeScreen scrollable>
        <ScreenHeader title="Kickstand" subtitle={getGreeting()} />
        <EmptyState
          title="No bikes yet"
          description="Add your first bike to start tracking mileage and compliance"
          actionLabel="Add bike"
          onAction={() => router.push('/(tabs)/garage/add' as any)}
        />
      </SafeScreen>
    );
  }

  const complianceItems = [
    { label: 'Inspection', dateField: activeBike.inspectionDue },
    { label: 'Road Tax', dateField: activeBike.roadTaxExpiry },
    { label: 'Insurance', dateField: activeBike.insuranceExpiry },
    { label: 'COE', dateField: activeBike.coeExpiry },
  ];

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title={activeBike.model}
        subtitle={getGreeting()}
        onTitlePress={bikes && bikes.length > 1 ? () => {/* bike switcher — future */ } : undefined}
      />

      {/* Mileage hero card */}
      <HeroCard>
        <Text className="text-xs font-sans-medium text-hero-muted uppercase tracking-widest mb-xs">
          Current Mileage
        </Text>
        <MetricDisplay
          value={activeBike.currentMileage.toLocaleString()}
          unit="km"
          size="xl"
          onHero
        />
        {activeBike.updatedAt ? (
          <Text className="text-xs font-sans text-hero-muted mt-xs">
            Updated {new Date(activeBike.updatedAt).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        ) : null}
      </HeroCard>

      {/* Compliance grid */}
      <Section label="Compliance">
        <View className="flex-row flex-wrap gap-sm">
          {complianceItems.map(({ label, dateField }) => {
            const days = daysUntil(dateField);
            const variant = getComplianceVariant(days);
            const value = days === null ? '–' : String(Math.abs(days));
            const unit = days === null ? '' : days < 0 ? 'overdue' : 'days';
            const dateDisplay = dateField
              ? new Date(dateField).toLocaleDateString('en-SG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Not set';
            return (
              <View key={label} style={{ width: '47%' }}>
                <StatusCard
                  label={label}
                  value={value}
                  unit={unit}
                  date={dateDisplay}
                  variant={variant}
                />
              </View>
            );
          })}
        </View>
      </Section>

      {/* Recent service placeholder */}
      <Section label="Recent Service">
        <Text className="text-sm font-sans text-muted text-center py-lg">
          No services logged yet
        </Text>
      </Section>
    </SafeScreen>
  );
}
