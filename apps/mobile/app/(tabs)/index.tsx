import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SafeScreen } from '../../components/ui/safe-screen';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/ui/empty-state';
import { DevAuthToggle } from '../../components/dev/DevAuthToggle';

import { TopBar, Pedestal, Badge, Icon, SectionHead, Row, BikeSwitcher, type IconName } from '../../components/ui/atelier';

import { useBikes } from '../../lib/api/use-bikes';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { computeNextService } from '../../lib/prediction/compute-next-service';
import { getActiveSeasonalCallout } from '../../lib/seasonal';
import { serviceTypeToMeta } from '../../lib/service-type-meta';
import { daysAgo, formatDaysAgo } from '../../lib/format';
import { yellowTint } from '../../lib/colors';
import { serviceTypeIcon } from '../../lib/service-icon';

// ─── Local sub-components ──────────────────────────────────────────────────

function UpTile({
  icon,
  label,
  value,
  unit,
  sub,
  accent = false,
}: {
  icon: IconName;
  label: string;
  value: number;
  unit: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <View
      className={`flex-shrink-0 w-[152px] p-4 border rounded-[18px] ${accent ? 'bg-ink border-ink' : 'bg-transparent border-hairline-2'}`}
    >
      <Icon name={icon} size={22} stroke={accent ? '#F4F2EC' : '#1A1A1A'} />
      <View className="flex-row items-baseline gap-1 mt-8">
        <Text
          className={`font-sans-semibold text-[26px] tracking-[-0.02em] ${accent ? 'text-bg' : 'text-ink'}`}
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {value}
        </Text>
        <Text
          className="font-mono text-[10px] tracking-[0.1em]"
          style={{ opacity: 0.65, color: accent ? '#F4F2EC' : '#1A1A1A' }}
        >
          {unit}
        </Text>
      </View>
      <Text className={`font-sans-medium text-[12px] mt-0.5 ${accent ? 'text-bg' : 'text-ink'}`}>
        {label}
      </Text>
      <Text
        className="font-mono text-[10px] tracking-[0.06em] mt-0.5"
        style={{ opacity: 0.55, color: accent ? '#F4F2EC' : '#1A1A1A' }}
      >
        {sub}
      </Text>
    </View>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { data: bikes, isLoading } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const [monsoonDismissed] = useState(false);

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
        lastServiceMileage: lastService?.mileageAt ?? null,
        lastServiceDate: lastService ? new Date(lastService.date) : null,
      }),
    [activeBike, lastService],
  );

  const callout = useMemo(() => getActiveSeasonalCallout(), []);

  // TODO: wire once add-bike FAB / prediction detail / service entry CTA land in later batches
  // handleAddBike → router.push('/add-bike')
  // handlePrediction → router.push('/prediction')
  // handleServiceEntry → router.push('/add-service')

  const [bikeSwitcherOpen, setBikeSwitcherOpen] = useState(false);

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

  // ────────────── Derived display values ──────────────
  const lastServiceLabel = lastService?.date
    ? formatDaysAgo(daysAgo(lastService.date))
    : '—';
  const whenDueLabel = `${prediction.daysUntil}d`;

  const upcomingServices = [
    { type: 'oil',   icon: 'oil' as IconName,   label: 'Engine oil',  days: prediction.daysUntil, km: prediction.kmUntil },
    { type: 'chain', icon: 'chain' as IconName, label: 'Chain lube',  days: 6,   km: 120 },
    { type: 'tyre',  icon: 'tire' as IconName,  label: 'Tyre check',  days: 42,  km: 2110 },
    { type: 'brake', icon: 'brake' as IconName, label: 'Brake pads',  days: 94,  km: 4800 },
  ];

  const costCategories = [
    { label: 'Tyres',         icon: 'tire' as IconName,   value: 860, ratio: 0.82 },
    { label: 'Consumables',   icon: 'oil' as IconName,    value: 640, ratio: 0.61 },
    { label: 'Repair',        icon: 'wrench' as IconName, value: 520, ratio: 0.50 },
    { label: 'Modifications', icon: 'tune' as IconName,   value: 240, ratio: 0.23 },
    { label: 'Compliance',    icon: 'shield' as IconName, value: 80,  ratio: 0.08 },
  ];

  // ────────────── Main state ──────────────
  return (
    <View className="flex-1 bg-bg">
      {/* Top bar with bike selector + notifications bell */}
      <TopBar
        bike={activeBike.model ?? (activeBike as any).name ?? 'My Bike'}
        unread={0}
        onBikePress={() => setBikeSwitcherOpen(true)}
        onBellPress={() => router.push('/notifications' as any)}
      />

      <BikeSwitcher
        visible={bikeSwitcherOpen}
        onClose={() => setBikeSwitcherOpen(false)}
        bikes={bikes ?? []}
        activeBikeId={activeBike.id}
        onSelect={setActiveBikeId}
        onAddBike={() => router.push('/add-bike')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── 1. Hero pedestal ── */}
        <Pedestal>
          {/* Eyebrow + badge row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="font-mono text-[10px] tracking-[0.12em] uppercase"
              style={{ opacity: 0.55, color: '#F4F2EC' }}
            >
              Next service · Engine oil
            </Text>
            <Badge tone="accent">ON PACE</Badge>
          </View>

          {/* Big countdown number */}
          <View className="flex-row items-end gap-2 mt-2">
            <Text
              className="font-display text-yellow leading-none"
              style={{ fontSize: 78 }}
            >
              {prediction.daysUntil}
            </Text>
            <Text
              className="font-mono text-[11px] tracking-[0.1em] uppercase mb-3"
              style={{ color: '#F4F2EC', opacity: 0.7 }}
            >
              DAYS
            </Text>
          </View>

          {/* KM sub-label */}
          <Text
            className="font-mono text-[11px] tracking-[0.08em] uppercase mt-1"
            style={{ color: '#F4F2EC', opacity: 0.55 }}
          >
            OR {prediction.kmUntil.toLocaleString()} KM
          </Text>

          {/* Pace bar section */}
          <View className="mt-5">
            {/* Labels row */}
            <View className="flex-row justify-between mb-2">
              <Text
                className="font-mono text-[10px] tracking-[0.06em]"
                style={{ color: '#F4F2EC', opacity: 0.5 }}
              >
                Last · {lastServiceLabel}
              </Text>
              <Text
                className="font-mono text-[10px] tracking-[0.06em]"
                style={{ color: '#F4F2EC', opacity: 0.5 }}
              >
                Today · {Math.round(prediction.idealProgress * 100)}%
              </Text>
              <Text
                className="font-mono text-[10px] tracking-[0.06em]"
                style={{ color: '#F4F2EC', opacity: 0.5 }}
              >
                Due · {whenDueLabel}
              </Text>
            </View>

            {/* Hairline track with yellow fill */}
            <View
              className="w-full rounded-full overflow-hidden"
              style={{ height: 3, backgroundColor: 'rgba(244,242,236,0.15)' }}
            >
              <View
                className="h-full rounded-full bg-yellow"
                style={{ width: `${prediction.idealProgress * 100}%` }}
              />
            </View>
          </View>
        </Pedestal>

        {/* ── 2. Seasonal callout ── */}
        {callout && !monsoonDismissed && (
          <View
            className="mx-4 mt-4 p-4 rounded-2xl flex-row gap-3 border border-hairline-2"
          >
            {/* Icon well */}
            <View
              className="w-10 h-10 items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: yellowTint(0.12) }}
            >
              <Icon name="zap" size={18} stroke="#F2D06B" />
            </View>

            {/* Text column */}
            <View className="flex-1">
              <Text className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mb-0.5">
                {callout.eyebrow ?? 'SEASONAL'}
              </Text>
              <Text className="font-sans-semibold text-[14px] text-ink tracking-[-0.01em]">
                {callout.title}
              </Text>
              <Text className="font-sans-medium text-[13px] text-muted mt-0.5">
                {callout.body}
              </Text>
            </View>
          </View>
        )}

        {/* ── 3. Upcoming services carousel ── */}
        <View className="mt-6 px-4">
          <SectionHead
            title="Upcoming"
            action="ALL"
            onActionPress={() => {}}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
        >
          {upcomingServices.map((svc, i) => (
            <UpTile
              key={svc.type}
              icon={svc.icon}
              label={svc.label}
              value={svc.days}
              unit="DAYS"
              sub={`or ${svc.km.toLocaleString()} km`}
              accent={i === 0}
            />
          ))}
        </ScrollView>

        {/* ── 4. Cost breakdown ── */}
        <View className="mt-6 px-4">
          {/* Header */}
          <View className="flex-row items-baseline justify-between mb-4">
            <View>
              <Text className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mb-0.5">
                LAST 12 MONTHS
              </Text>
              <Text className="font-sans-semibold text-[13px] text-ink tracking-[-0.01em]">
                Cost breakdown
              </Text>
            </View>
            <Pressable onPress={() => {}}>
              <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                DETAIL →
              </Text>
            </Pressable>
          </View>

          {/* Category rows */}
          {costCategories.map((c) => (
            <View
              key={c.label}
              className="flex-row items-center gap-3 py-3 border-b border-hairline"
            >
              <Icon name={c.icon} size={16} stroke="#1A1A1A" />
              <Text
                className="font-sans-medium text-[13px] text-ink"
                style={{ width: 88 }}
              >
                {c.label}
              </Text>
              {/* Progress bar */}
              <View
                className="flex-1 rounded-sm overflow-hidden"
                style={{ height: 6, backgroundColor: '#E8E5DF' }}
              >
                <View
                  className="h-full bg-ink rounded-sm"
                  style={{ width: `${c.ratio * 100}%` }}
                />
              </View>
              {/* Value */}
              <Text
                className="font-mono text-[12px] text-ink text-right"
                style={{ fontVariant: ['tabular-nums'], minWidth: 60 }}
              >
                S${c.value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── 5. Recent services ── */}
        <View className="mt-6 px-4">
          <SectionHead
            title="Recent services"
            action="LOG"
            onActionPress={() => router.navigate('/(tabs)/service')}
          />
          {recentServices.length === 0 ? (
            <Text className="text-sm font-sans-medium text-ink/55 py-4 text-center">
              Nothing logged yet — tap + to add a service.
            </Text>
          ) : (
            recentServices.slice(0, 3).map((r) => (
              <Row
                key={r.id}
                icon={serviceTypeIcon(r.serviceType)}
                title={serviceTypeToMeta(r.serviceType).label}
                sub={`${formatDaysAgo(daysAgo(r.date))} · ${r.mileageAt?.toLocaleString() ?? '—'} km`}
                trail={r.cost ? 'S$' + parseFloat(r.cost).toFixed(0) : undefined}
                onPress={() => router.push(`/edit-service?id=${r.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
