import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';
import { HeroCard } from '../../components/ui/hero-card';
import { Section } from '../../components/ui/section';
import { StatusCard } from '../../components/ui/status-card';
import { MetricDisplay } from '../../components/ui/metric-display';
import { WelcomeScreen } from '../../components/welcome-screen';
import { Skeleton } from '../../components/ui/skeleton';
import { useBikes } from '../../lib/api/use-bikes';
import { useBikeStore } from '../../lib/store/bike-store';
import { daysUntil, getComplianceVariant } from '../../lib/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not set';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function DashboardScreen() {
  const { data: bikes, isLoading } = useBikes();
  const activeBikeId = useBikeStore((s) => s.activeBikeId);

  const activeBike = bikes?.find((b) => b.id === activeBikeId) ?? bikes?.[0] ?? null;

  if (isLoading) {
    return (
      <SafeScreen scrollable>
        <View className="gap-sm pt-lg">
          <Skeleton height={48} className="w-48 mb-lg" />
          <Skeleton height={140} className="mb-lg" />
          <Skeleton height={200} />
        </View>
      </SafeScreen>
    );
  }

  if (!isLoading && !activeBike) {
    return <WelcomeScreen />;
  }

  const inspectionDays = daysUntil(activeBike?.inspectionDue ?? null);
  const roadTaxDays = daysUntil(activeBike?.roadTaxExpiry ?? null);
  const insuranceDays = daysUntil(activeBike?.insuranceExpiry ?? null);
  const coeDays = daysUntil(activeBike?.coeExpiry ?? null);

  const complianceItems = [
    { label: 'Inspection', days: inspectionDays, date: activeBike?.inspectionDue ?? null },
    { label: 'Road Tax', days: roadTaxDays, date: activeBike?.roadTaxExpiry ?? null },
    { label: 'Insurance', days: insuranceDays, date: activeBike?.insuranceExpiry ?? null },
    { label: 'COE', days: coeDays, date: activeBike?.coeExpiry ?? null },
  ];

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        subtitle={getGreeting()}
        title={activeBike?.model ?? '…'}
      />

      <HeroCard>
        <Text className="text-xs font-sans-medium text-hero-muted uppercase tracking-widest mb-xs">
          Current Mileage
        </Text>
        {activeBike ? (
          <MetricDisplay
            value={activeBike.currentMileage.toLocaleString()}
            unit="km"
            size="xl"
            onHero
          />
        ) : null}
      </HeroCard>

      <Section label="Compliance">
        <View className="flex-row flex-wrap gap-sm">
          {complianceItems.map((item) => (
            <View key={item.label} className="w-[47%]">
              <StatusCard
                label={item.label}
                value={item.days !== null ? Math.abs(item.days) : '—'}
                unit={item.days !== null ? (Math.abs(item.days) === 1 ? 'day' : 'days') : ''}
                date={formatDate(item.date)}
                variant={getComplianceVariant(item.days)}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section label="Recent Service">
        <Text className="text-sm text-text-muted font-sans py-sm">
          No services logged yet
        </Text>
      </Section>
    </SafeScreen>
  );
}
