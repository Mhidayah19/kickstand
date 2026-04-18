import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAttention } from '../../lib/api/use-attention';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { colors } from '../../lib/colors';
import { AttentionDetailHero } from '../../components/attention/attention-detail-hero';
import { AttentionProgressBar } from '../../components/attention/attention-progress-bar';
import { AttentionMetaGrid } from '../../components/attention/attention-meta-grid';
import { AttentionHistoryList } from '../../components/attention/attention-history-list';
import type { AttentionItem } from '../../lib/types/attention';

const COMPLIANCE_APPROACHING_DAYS = 30;

function progressFor(item: AttentionItem): number {
  if (item.category === 'maintenance') {
    if (item.intervalKm && item.lastMileage != null) {
      const used = item.currentMileage - item.lastMileage;
      return used / item.intervalKm;
    }
    return item.status === 'overdue' ? 1 : 0;
  }
  // Compliance: progress through the 30-day approaching window (clamped 0..1)
  const elapsed = COMPLIANCE_APPROACHING_DAYS - item.daysRemaining;
  return Math.min(Math.max(elapsed / COMPLIANCE_APPROACHING_DAYS, 0), 1);
}

function maintenanceCells(item: Extract<AttentionItem, { category: 'maintenance' }>) {
  const cells = [
    {
      label: 'Last Serviced',
      value: item.lastMileage != null ? `${item.lastMileage.toLocaleString('en-SG')} KM` : 'Never',
      sub: item.lastDate ?? undefined,
    },
    {
      label: 'Current',
      value: `${item.currentMileage.toLocaleString('en-SG')} KM`,
      sub: 'Today',
    },
  ];
  const intervalParts: string[] = [];
  if (item.intervalKm) intervalParts.push(`Every ${item.intervalKm.toLocaleString('en-SG')} km`);
  if (item.intervalMonths) intervalParts.push(`${item.intervalMonths} months`);
  if (intervalParts.length > 0) {
    cells.push({ label: 'Recommended Interval', value: intervalParts.join(' or '), sub: undefined });
  }
  return cells;
}

function complianceCells(item: Extract<AttentionItem, { category: 'compliance' }>) {
  return [
    { label: 'Expires On', value: item.expiresAt, sub: undefined },
    {
      label: 'Days Remaining',
      value: item.daysRemaining < 0
        ? `${Math.abs(item.daysRemaining)} over`
        : item.daysRemaining.toString(),
      sub: undefined,
    },
  ];
}

export default function NotificationItemScreen() {
  const { itemKey } = useLocalSearchParams<{ itemKey: string }>();
  const router = useRouter();
  const { activeBikeId } = useBikeStore();
  const { data, isLoading } = useAttention(activeBikeId);
  // useServiceLogs returns PaginatedResponse<ServiceLog> directly as data
  // logsResponse.data is ServiceLog[]
  const { data: logsResponse } = useServiceLogs(activeBikeId, 100);

  const item = useMemo<AttentionItem | null>(() => {
    if (!data || !itemKey) return null;
    return data.items.find((i) => i.key === itemKey) ?? null;
  }, [data, itemKey]);

  const historyLogs = useMemo(() => {
    if (!item || item.category !== 'maintenance' || !logsResponse?.data) return [];
    return logsResponse.data.filter((log) => log.serviceType === item.key);
  }, [item, logsResponse]);

  const handleCta = useCallback(() => {
    if (!item || !activeBikeId) return;
    if (item.category === 'maintenance') {
      router.push({ pathname: '/add-service', params: { serviceType: item.key } });
    } else {
      router.push(`/(tabs)/garage/${activeBikeId}/edit`);
    }
  }, [item, activeBikeId, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={colors.sand} />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6 pt-2 pb-3 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-sans-xbold text-lg text-charcoal mb-2">Item not found</Text>
          <Text className="font-sans-medium text-sm text-sand text-center">
            This item may have been resolved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cells = item.category === 'maintenance' ? maintenanceCells(item) : complianceCells(item);
  const ctaLabel = item.category === 'maintenance' ? 'Log this service' : 'Update expiry';

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-2 pb-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-xbold text-base text-charcoal">{item.label}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <AttentionDetailHero item={item} />
        <AttentionProgressBar progress={progressFor(item)} status={item.status} />
        <AttentionMetaGrid cells={cells} />
        {item.category === 'maintenance' && <AttentionHistoryList logs={historyLogs} />}

        <Pressable
          onPress={handleCta}
          className="bg-yellow rounded-full py-4 items-center active:opacity-80 mt-4"
        >
          <Text className="font-sans-xbold text-xs text-charcoal uppercase tracking-widest">
            {ctaLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
