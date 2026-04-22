import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../lib/colors';
import { daysUntil } from '../../../lib/theme';
import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EmptyState } from '../../../components/ui/empty-state';
import { Skeleton } from '../../../components/ui/skeleton';
import { TopAppBar } from '../../../components/ui/top-app-bar';
import { useDeleteBike, useBike, useBikes } from '../../../lib/api/use-bikes';
import { useAttention } from '../../../lib/api/use-attention';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../lib/service-type-meta';
import { formatComplianceDate, formatLogDate } from '../../../lib/format';
import { serviceTypeIcon } from '../../../lib/service-icon';
import {
  TopBar,
  BikeSwitcher,
  Eyebrow,
  Badge,
  SectionHead,
  Row,
} from '../../../components/ui/atelier';

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-1.5">{label}</Text>
      <Text className="font-sans-semibold text-[16px] tracking-[-0.01em] text-ink">{value}</Text>
    </View>
  );
}

function CompTile({
  label, valueText, dateText, urgent = false,
}: { label: string; valueText: string; dateText: string; urgent?: boolean }) {
  return (
    <View
      className={`p-[14px] rounded-[14px] border ${urgent ? 'border-danger' : 'border-hairline-2'}`}
      style={urgent ? { backgroundColor: 'rgba(220,38,38,0.08)' } : undefined}
    >
      <Text className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mb-2">
        {label}
      </Text>
      <Text
        className={`font-sans-semibold text-[20px] tracking-[-0.02em] ${urgent ? 'text-danger' : 'text-ink'}`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {valueText}
      </Text>
      <Text className="font-mono text-[10px] text-muted mt-0.5">
        {dateText}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------

export default function GarageScreen() {
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bikes = [], isLoading: bikesLoading } = useBikes();
  const { data: bike, isLoading: bikeLoading } = useBike(activeBikeId);
  const { data: logsData } = useServiceLogs(activeBikeId, 3);
  const { data: attention } = useAttention(activeBikeId);
  const deleteBike = useDeleteBike(activeBikeId ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bikeSwitcherOpen, setBikeSwitcherOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const logs = logsData?.data ?? [];
  const bikeList = useMemo(
    () => bikes.map((b) => ({ id: b.id, model: b.model, year: b.year })),
    [bikes]
  );
  const activeBikeMeta = useMemo(
    () => bike ? { id: bike.id, model: bike.model, year: bike.year } : undefined,
    [bike]
  );
  const badgeCount = attention?.summary.needsAttention ?? 0;
  const contentInsets = useMemo(
    () => ({ top: insets.top, bottom: insets.bottom, left: 4, right: 4 }),
    [insets.top, insets.bottom]
  );

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    setShowDeleteDialog(false);
    const remaining = bikes.filter((b) => b.id !== activeBikeId);
    if (remaining.length > 0) setActiveBikeId(remaining[0].id);
  };

  const isLoading = bikesLoading || (!!activeBikeId && bikeLoading);

  // ── Loading state (Option A — keep existing TopAppBar) ──────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <TopAppBar
          activeBike={activeBikeMeta}
          bikes={bikeList}
          onBikeChange={setActiveBikeId}
          onNotificationPress={() => router.push('/notifications' as any)}
          onAddBikePress={() => router.push('/add-bike')}
          unreadNotifications={0}
        />
        <ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 128 }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton height={280} className="mx-4 rounded-3xl mb-6" />
          <View className="px-6">
            <Skeleton height={24} className="rounded-md mb-2 w-24" />
            <Skeleton height={40} className="rounded-md mb-2 w-48" />
            <Skeleton height={16} className="rounded-md mb-8 w-20" />
            <Skeleton height={160} className="rounded-3xl mb-4" />
            <Skeleton height={200} className="rounded-3xl" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Empty state (Option A — keep existing TopAppBar) ────────────────────
  if (!activeBikeId || !bike) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <TopAppBar
          activeBike={undefined}
          bikes={bikeList}
          onBikeChange={setActiveBikeId}
          onNotificationPress={() => router.push('/notifications' as any)}
          onAddBikePress={() => router.push('/add-bike')}
          unreadNotifications={0}
        />
        <View className="flex-1 px-6" style={{ paddingTop: 80 }}>
          <EmptyState
            title="Your Garage is Empty"
            description="Add your first motorcycle to start tracking maintenance and compliance."
            actionLabel="Add a Motorcycle"
            onAction={() => router.push('/add-bike')}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Derive compliance data ───────────────────────────────────────────────
  const complianceItems = [
    { label: 'COE', date: bike.coeExpiry },
    { label: 'Road Tax', date: bike.roadTaxExpiry },
    { label: 'Insurance', date: bike.insuranceExpiry },
    { label: 'Inspection', date: bike.inspectionDue },
  ].filter((item): item is typeof item & { date: string } => !!item.date);

  const compliance = complianceItems.map((item) => {
    const days = daysUntil(item.date);
    const urgent = days !== null && days <= 30;
    const valueText = days === null ? '—' : days <= 0 ? 'Overdue' : `${days}d`;
    return {
      key: item.label,
      label: item.label.toUpperCase(),
      valueText,
      dateText: `EXP ${(formatComplianceDate(item.date) ?? '').toUpperCase()}`,
      urgent,
    };
  });
  const complianceUrgentCount = compliance.filter((c) => c.urgent).length;

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-bg">
      {/* TopBar (atelier) */}
      <TopBar
        bike={`${bike.model}${bike.year ? ` · ${bike.year}` : ''}`}
        unread={badgeCount}
        onBikePress={() => setBikeSwitcherOpen(true)}
        onBellPress={() => router.push('/notifications' as any)}
      />

      <BikeSwitcher
        visible={bikeSwitcherOpen}
        onClose={() => setBikeSwitcherOpen(false)}
        bikes={bikes}
        activeBikeId={activeBikeId}
        onSelect={setActiveBikeId}
        onAddBike={() => router.push('/add-bike')}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 2. Hero card ── */}
        <View className="mx-4 mt-4 rounded-[28px] bg-bg-2 overflow-hidden" style={{ minHeight: 180 }}>
          {bike.imageUrl ? (
            <Image
              source={{ uri: bike.imageUrl }}
              className="absolute inset-0"
              style={{ opacity: 0.7 }}
              resizeMode="cover"
            />
          ) : null}
          <View className="p-5 pb-5">
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Eyebrow>Active bike</Eyebrow>
                <Text className="font-display text-[32px] leading-[1.05] text-ink mt-1.5">
                  {bike.model}
                </Text>
                <Text className="font-mono text-[11px] tracking-[0.14em] text-muted mt-1">
                  {bike.year} · {bike.currentMileage.toLocaleString()} KM
                </Text>
              </View>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable
                    hitSlop={8}
                    className="w-9 h-9 items-center justify-center rounded-[10px] border border-hairline-2"
                  >
                    <MaterialCommunityIcons name="dots-vertical" size={18} color="#1A1A1A" />
                  </Pressable>
                </DropdownMenuTrigger>
                <DropdownMenuContent insets={contentInsets} sideOffset={4} align="end">
                  <DropdownMenuItem onPress={() => router.push(`/(tabs)/garage/${activeBikeId}/edit` as any)}>
                    <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.charcoal} />
                    <Text className="text-sm font-sans-bold text-charcoal">Edit Bike</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onPress={() => setShowDeleteDialog(true)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
                    <Text className="text-sm font-sans-bold text-danger">Delete Bike</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
        </View>

        {/* ── 3. 4-item spec strip ── */}
        <View className="flex-row px-5 py-5 border-b border-hairline">
          <SpecItem label="Plate" value={bike.plateNumber ?? '—'} />
          <SpecItem label="Class" value={`Class ${bike.class ?? '—'}`} />
          <SpecItem label="Engine" value={bike.engineCc ? `${bike.engineCc}cc` : '—'} />
          <SpecItem label="Type" value={bike.bikeType ?? '—'} />
        </View>

        {/* ── 4. Compliance 2×2 ── */}
        {compliance.length > 0 && (
          <View className="px-5 pt-7 pb-2">
            <View className="flex-row items-baseline justify-between mb-[14px]">
              <Text className="font-sans-semibold text-[13px] tracking-[-0.01em] text-ink">Compliance</Text>
              {complianceUrgentCount > 0 ? (
                <Badge tone="danger">{complianceUrgentCount} URGENT</Badge>
              ) : null}
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {compliance.map((c) => (
                <View key={c.key} style={{ width: '48%' }}>
                  <CompTile label={c.label} valueText={c.valueText} dateText={c.dateText} urgent={c.urgent} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 5. Service history ── */}
        <View className="px-5 pt-7 pb-24">
          <SectionHead
            title="Service history"
            action="ALL"
            onActionPress={() => router.push('/(tabs)/service')}
          />
          {logs.slice(0, 3).map((log) => {
            const meta = serviceTypeToMeta(log.serviceType);
            return (
              <Row
                key={log.id}
                icon={serviceTypeIcon(log.serviceType)}
                title={meta.label}
                sub={`${formatLogDate(log.date)} · ${log.mileageAt.toLocaleString()} KM`}
                trail={log.cost ? `S$${parseFloat(log.cost).toFixed(0)}` : undefined}
                onPress={() => router.push(`/edit-service?id=${log.id}` as any)}
              />
            );
          })}
        </View>
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title={`Delete ${bike.model}?`}
        body="This will also delete all service history for this bike. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
}
