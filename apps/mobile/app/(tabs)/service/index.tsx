import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopAppBar } from '../../../components/ui/top-app-bar';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { FilterChips } from '../../../components/ui/filter-chips';
import { TimelineEntry } from '../../../components/ui/timeline-entry';
import { PrimaryButton } from '../../../components/ui/primary-button';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBike, useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ICONS,
  SERVICE_TYPE_COLORS,
  SERVICE_FILTER_GROUPS,
  FILTER_OPTIONS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey, FilterGroupKey } from '../../../lib/constants/service-types';
import type { ServiceLog } from '../../../lib/types/service-log';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
}

function formatCost(cost: string): string {
  const num = parseFloat(cost);
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
}

function mapLogToTimeline(log: ServiceLog) {
  const key = log.serviceType as ServiceTypeKey;
  return {
    date: formatDate(log.date),
    title: SERVICE_TYPE_LABELS[key] ?? log.serviceType,
    cost: formatCost(log.cost),
    icon: (SERVICE_TYPE_ICONS[key] ?? 'wrench') as string,
    color: SERVICE_TYPE_COLORS[key] ?? ('charcoal' as const),
    tags: [{ label: SERVICE_TYPE_LABELS[key] ?? log.serviceType }],
    quote: log.description || undefined,
  };
}

export default function ServiceScreen() {
  const router = useRouter();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bike } = useBike(activeBikeId);
  const { data: bikes } = useBikes();
  const { data: logsResponse, isLoading } = useServiceLogs(activeBikeId);
  const [selectedFilter, setSelectedFilter] = useState<FilterGroupKey>('All');

  const logs = logsResponse?.data ?? [];

  const filteredLogs = useMemo(() => {
    if (selectedFilter === 'All') return logs;
    const allowedTypes = SERVICE_FILTER_GROUPS[selectedFilter] as readonly ServiceTypeKey[];
    return logs.filter((log) => allowedTypes.includes(log.serviceType as ServiceTypeKey));
  }, [logs, selectedFilter]);

  const totalSpend = useMemo(() => {
    const sum = logs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0);
    return `$${sum.toFixed(2)}`;
  }, [logs]);

  const handleAddBike = useCallback(() => {
    router.push('/(tabs)/garage/add' as any);
  }, []);

  const isEmpty = !isLoading && logs.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar
        activeBike={bike && { id: bike.id, model: bike.model, year: bike.year }}
        bikes={bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? []}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      />

      {/* Fixed header */}
      <View className="px-6" style={{ paddingTop: 80 }}>
        <ScreenHeader title="Service" size="md" />

        {/* Active bike context */}
        {bike && (
          <Text className="font-sans-medium text-sm text-sand mb-3">
            {bike.make} {bike.model} {bike.year && `• ${bike.year}`}
          </Text>
        )}

        {/* Total spend */}
        {logs.length > 0 && (
          <View className="bg-charcoal self-start px-4 py-2 rounded-xl mb-6">
            <Text className="font-sans-xbold text-lg text-surface-card">{totalSpend}</Text>
          </View>
        )}
      </View>

      {/* Filter chips */}
      {logs.length > 0 && (
        <View className="mb-4 px-6">
          <FilterChips
            options={FILTER_OPTIONS}
            selected={selectedFilter}
            onSelect={(v) => setSelectedFilter(v as FilterGroupKey)}
            wrap={false}
          />
        </View>
      )}

      {/* Timeline or empty state */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.sand} />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 items-center justify-center px-8">
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={colors.sand} />
          <Text className="font-sans-xbold text-xl text-charcoal mt-6 mb-2 text-center">
            No services logged yet
          </Text>
          <Text className="font-sans-medium text-sm text-sand text-center mb-8">
            Log your first service to start tracking your maintenance history.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredLogs.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Text className="font-sans-medium text-sm text-sand text-center">
                No services in this category
              </Text>
            </View>
          ) : (
            <View className="relative">
              {/* Vertical timeline line */}
              <View
                className="absolute bg-sand/30"
                style={{ left: 16, top: 0, bottom: 0, width: 2 }}
              />
              {filteredLogs.map((log) => {
                const props = mapLogToTimeline(log);
                return <TimelineEntry key={log.id} {...props} />;
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
