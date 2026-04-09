import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopAppBar } from '../../../components/ui/top-app-bar';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { TimelineEntry } from '../../../components/ui/timeline-entry';
import { ServiceSearchBar } from '../../../components/service/service-search-bar';
import { AnalyticsSheet } from '../../../components/service/analytics-sheet';
import { FilterSheet } from '../../../components/service/filter-sheet';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBike, useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { useAttention } from '../../../lib/api/use-attention';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_COLORS,
  SERVICE_FILTER_GROUPS,
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

function formatMileage(km: number): string {
  return `${km.toLocaleString()} km`;
}

function mapLogToTimeline(log: ServiceLog) {
  const key = log.serviceType as ServiceTypeKey;
  return {
    title: SERVICE_TYPE_LABELS[key] ?? log.serviceType,
    cost: formatCost(log.cost),
    color: SERVICE_TYPE_COLORS[key] ?? ('charcoal' as const),
    quote: log.description || undefined,
    parts: log.parts ?? undefined,
    mileage: log.mileageAt ? formatMileage(log.mileageAt) : undefined,
  };
}

export default function ServiceScreen() {
  const router = useRouter();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bike } = useBike(activeBikeId);
  const { data: bikes } = useBikes();
  const { data: logsResponse, isLoading } = useServiceLogs(activeBikeId, 100);
  const { data: attention } = useAttention(activeBikeId);

  const badgeCount = attention?.summary.needsAttention ?? 0;
  const handleNotificationPress = useCallback(() => {
    router.push('/notifications' as any);
  }, [router]);

  const [selectedFilter, setSelectedFilter] = useState<FilterGroupKey>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const logs = logsResponse?.data ?? [];

  useEffect(() => {
    setSearchQuery('');
    setDateRange(null);
    setSelectedFilter('All');
  }, [activeBikeId]);

  const dateFilteredLogs = useMemo(() => {
    if (!dateRange) return logs;
    return logs.filter((log) => log.date >= dateRange.from && log.date <= dateRange.to);
  }, [logs, dateRange]);

  const categoryFilteredLogs = useMemo(() => {
    if (selectedFilter === 'All') return dateFilteredLogs;
    const allowedTypes = SERVICE_FILTER_GROUPS[selectedFilter] as readonly ServiceTypeKey[];
    return dateFilteredLogs.filter((log) =>
      allowedTypes.includes(log.serviceType as ServiceTypeKey),
    );
  }, [dateFilteredLogs, selectedFilter]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return categoryFilteredLogs;
    const q = searchQuery.toLowerCase().trim();
    return categoryFilteredLogs.filter((log) => {
      const label = (
        SERVICE_TYPE_LABELS[log.serviceType as ServiceTypeKey] ?? log.serviceType
      ).toLowerCase();
      const desc = log.description.toLowerCase();
      const parts = (log.parts ?? []).join(' ').toLowerCase();
      return label.includes(q) || desc.includes(q) || parts.includes(q);
    });
  }, [categoryFilteredLogs, searchQuery]);

  const totalSpend = useMemo(
    () => logs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0),
    [logs],
  );

  const dateFilteredTotalSpend = useMemo(
    () =>
      dateRange
        ? dateFilteredLogs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0)
        : totalSpend,
    [dateFilteredLogs, dateRange, totalSpend],
  );

  const groupedLogs = useMemo(() => {
    const map = new Map<string, ServiceLog[]>();
    for (const log of filteredLogs) {
      const key = log.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries()).map(([dateKey, entries]) => ({ dateKey, entries }));
  }, [filteredLogs]);

  const hasActiveFilters = selectedFilter !== 'All' || dateRange !== null;
  const activeFilterCount = (selectedFilter !== 'All' ? 1 : 0) + (dateRange ? 1 : 0);

  const handleAddBike = useCallback(() => {
    router.push('/add-bike');
  }, []);

  const isEmpty = !isLoading && logs.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar
        activeBike={bike && { id: bike.id, model: bike.model, year: bike.year }}
        bikes={bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? []}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
        onNotificationPress={handleNotificationPress}
        unreadNotifications={badgeCount}
      />

      <View className="px-6" style={{ paddingTop: 80 }}>
        <ScreenHeader
          title="Service History"
          size="md"
          rightAction={
            logs.length > 0 ? (
              <TouchableOpacity
                className="bg-yellow flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
                onPress={() => setAnalyticsVisible(true)}
                activeOpacity={0.8}
              >
                <Text className="font-sans-xbold text-sm text-charcoal">
                  ${totalSpend.toFixed(2)}
                </Text>
                <MaterialCommunityIcons name="trending-up" size={13} color={colors.charcoal} />
              </TouchableOpacity>
            ) : undefined
          }
        />

        {logs.length > 0 && (
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <ServiceSearchBar
                key={activeBikeId ?? 'none'}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-xl mb-3 bg-charcoal"
              style={{ height: 46, width: 46 }}
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={16}
                color={colors.white}
              />
              {hasActiveFilters && (
                <View className="bg-yellow rounded-full w-4 h-4 items-center justify-center">
                  <Text className="font-sans-xbold text-charcoal" style={{ fontSize: 10 }}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.sand} />
        </View>
      ) : isEmpty ? (
        <View className="flex-1 px-6 justify-center">
          <Text className="font-sans-xbold text-xl text-charcoal mb-2">
            No services logged yet
          </Text>
          <Text className="font-sans-medium text-sm text-sand">
            {bike
              ? `${bike.make} ${bike.model}'s service history starts here.`
              : 'Log your first service to start tracking your maintenance history.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredLogs.length === 0 ? (
            <View className="items-center justify-center py-16 gap-4">
              <Text className="font-sans-medium text-sm text-sand text-center">
                No services match your filters
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilter('All');
                  setDateRange(null);
                  setSearchQuery('');
                }}
                activeOpacity={0.7}
              >
                <Text className="font-sans-bold text-sm text-charcoal">Clear filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="relative">
              <View
                className="absolute bg-sand/50"
                style={{ left: 16, top: 0, bottom: 0, width: 2 }}
              />
              {groupedLogs.map(({ dateKey, entries }, groupIndex) => (
                <View key={dateKey}>
                  {/* Date node */}
                  <View
                    className="flex-row items-center"
                    style={{ marginTop: groupIndex === 0 ? 8 : 24, marginBottom: 12 }}
                  >
                    <View
                      className="absolute w-5 h-5 rounded-full bg-charcoal z-10"
                      style={{ left: 7 }}
                    />
                    <Text
                      className="font-sans-bold text-xxs text-sand uppercase tracking-widest"
                      style={{ marginLeft: 36 }}
                    >
                      {formatDate(dateKey)}
                    </Text>
                  </View>

                  {/* Entries for this date */}
                  {entries.map((log) => {
                    const props = mapLogToTimeline(log);
                    return (
                      <TimelineEntry
                        key={log.id}
                        {...props}
                        onPress={() => router.push(`/service/${log.id}`)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <AnalyticsSheet
        visible={analyticsVisible}
        onClose={() => setAnalyticsVisible(false)}
        logs={dateFilteredLogs}
        totalSpend={dateFilteredTotalSpend}
        bikeModel={bike?.model ?? ''}
        dateRange={dateRange}
      />

      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        selectedFilter={selectedFilter}
        dateRange={dateRange}
        onApply={(filter, range) => {
          setSelectedFilter(filter);
          setDateRange(range);
          setFilterSheetVisible(false);
        }}
      />
    </SafeAreaView>
  );
}
