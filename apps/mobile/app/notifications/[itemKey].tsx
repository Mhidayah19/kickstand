import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAttention } from '../../lib/api/use-attention';
import { useServiceLogs } from '../../lib/api/use-service-logs';
import { useBikeStore } from '../../lib/store/bike-store';
import { colors } from '../../lib/colors';
import { Icon, Eyebrow } from '../../components/ui/atelier';
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
  const elapsed = COMPLIANCE_APPROACHING_DAYS - item.daysRemaining;
  return Math.min(Math.max(elapsed / COMPLIANCE_APPROACHING_DAYS, 0), 1);
}

function maintenanceCells(item: Extract<AttentionItem, { category: 'maintenance' }>) {
  const cells = [
    {
      label: 'Last serviced',
      value: item.lastMileage != null ? `${item.lastMileage.toLocaleString('en-SG')} KM` : 'Never',
      sub: item.lastDate ?? undefined,
    },
    {
      label: 'Current mileage',
      value: `${item.currentMileage.toLocaleString('en-SG')} KM`,
      sub: 'Today',
    },
  ];
  const intervalParts: string[] = [];
  if (item.intervalKm) intervalParts.push(`Every ${item.intervalKm.toLocaleString('en-SG')} km`);
  if (item.intervalMonths) intervalParts.push(`${item.intervalMonths} months`);
  if (intervalParts.length > 0) {
    cells.push({ label: 'Recommended interval', value: intervalParts.join(' or '), sub: undefined });
  }
  return cells;
}

function complianceCells(item: Extract<AttentionItem, { category: 'compliance' }>) {
  return [
    { label: 'Expires on', value: item.expiresAt, sub: undefined },
    {
      label: 'Days remaining',
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
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color={colors.muted} />
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-5 pt-4 pb-3 flex-row items-center gap-4">
          <Pressable onPress={() => router.back()} hitSlop={12} className="w-9 h-9 items-center justify-center">
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevron" size={18} stroke={colors.ink} />
            </View>
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-display text-[28px] leading-[32px] tracking-[-0.025em] text-ink mb-2">
            Not found
          </Text>
          <Text className="font-sans text-sm text-muted text-center">
            This item may have been resolved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const cells = item.category === 'maintenance' ? maintenanceCells(item) : complianceCells(item);
  const ctaLabel = item.category === 'maintenance' ? 'Log service' : 'Update expiry';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Top bar */}
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()} hitSlop={12} className="w-9 h-9 items-center justify-center">
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevron" size={18} stroke={colors.ink} />
          </View>
        </Pressable>
        <Eyebrow>{item.category === 'maintenance' ? 'Maintenance' : 'Compliance'}</Eyebrow>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <AttentionDetailHero item={item} />
        <AttentionProgressBar progress={progressFor(item)} status={item.status} />
        <AttentionMetaGrid cells={cells} />
        {item.category === 'maintenance' && <AttentionHistoryList logs={historyLogs} />}

        <Pressable
          onPress={handleCta}
          className="bg-accent rounded-full py-4 items-center active:opacity-80 mt-6"
        >
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink">
            {ctaLabel}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
