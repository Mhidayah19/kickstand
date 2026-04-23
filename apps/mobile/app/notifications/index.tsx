import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAttention } from '../../lib/api/use-attention';
import { useBikeStore } from '../../lib/store/bike-store';
import { colors } from '../../lib/colors';
import { Icon, Eyebrow } from '../../components/ui/atelier';
import { AttentionHero } from '../../components/attention/attention-hero';
import { AttentionSection } from '../../components/attention/attention-section';
import { AttentionAllClearFooter } from '../../components/attention/attention-all-clear-footer';
import { AttentionEmptyState } from '../../components/attention/attention-empty-state';
import type { AttentionItem } from '../../lib/types/attention';

function formatDateLabel(d = new Date()): string {
  return d.toLocaleDateString('en-SG', { month: 'short', day: '2-digit' }).toUpperCase();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { activeBikeId } = useBikeStore();
  const { data, isLoading, error, refetch } = useAttention(activeBikeId);

  const grouped = useMemo(() => {
    if (!data) return { maintenance: [], compliance: [], ok: 0 };
    const needsAttention = data.items.filter((i) => i.status !== 'ok');
    return {
      maintenance: needsAttention.filter((i) => i.category === 'maintenance'),
      compliance: needsAttention.filter((i) => i.category === 'compliance'),
      ok: data.summary.ok,
    };
  }, [data]);

  const handleItemPress = useCallback(
    (item: AttentionItem) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/notifications/${item.key}` as any);
    },
    [router],
  );

  const bikeModel = data?.bike.model ?? '';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Top bar */}
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-4">
        <Pressable onPress={() => router.back()} hitSlop={12} className="w-9 h-9 items-center justify-center">
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <Icon name="chevron" size={18} stroke={colors.ink} />
          </View>
        </Pressable>
        <Eyebrow>Attention</Eyebrow>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.muted} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-display text-[28px] leading-[32px] tracking-[-0.01em] text-ink mb-2">
            Could not load
          </Text>
          <Text className="font-sans text-sm text-muted text-center mb-6">
            Check your connection and try again.
          </Text>
          <Pressable onPress={() => refetch()} hitSlop={8} className="active:opacity-60">
            <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink">Retry</Text>
          </Pressable>
        </View>
      ) : !data || data.summary.needsAttention === 0 ? (
        <AttentionEmptyState bikeModel={bikeModel} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, paddingTop: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <AttentionHero
            count={data.summary.needsAttention}
            bikeModel={bikeModel}
            dateLabel={formatDateLabel()}
          />

          <AttentionSection
            title="Maintenance"
            items={grouped.maintenance}
            onItemPress={handleItemPress}
          />

          <AttentionSection
            title="Compliance"
            items={grouped.compliance}
            onItemPress={handleItemPress}
          />

          <AttentionAllClearFooter count={grouped.ok} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
