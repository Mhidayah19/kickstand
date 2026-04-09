import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAttention } from '../../lib/api/use-attention';
import { useBikeStore } from '../../lib/store/bike-store';
import { colors } from '../../lib/colors';
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
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-2 pb-3 flex-row items-center gap-3">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
        </Pressable>
        <Text className="font-sans-xbold text-base text-charcoal">Needs Attention</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.sand} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-sans-xbold text-lg text-charcoal mb-2">Couldn&apos;t load status</Text>
          <Pressable onPress={() => refetch()} className="mt-4">
            <Text className="font-sans-bold text-sm text-charcoal">Retry</Text>
          </Pressable>
        </View>
      ) : !data || data.summary.needsAttention === 0 ? (
        <AttentionEmptyState bikeModel={bikeModel} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 16 }}
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
