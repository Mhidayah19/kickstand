import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { Section } from '../../../components/ui/section';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { TimelineEntry } from '../../../components/ui/timeline-entry';
import { ServiceSearchBar } from '../../../components/service/service-search-bar';
import { AnalyticsSheet } from '../../../components/service/analytics-sheet';
import { FilterSheet } from '../../../components/service/filter-sheet';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBike, useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../lib/service-type-meta';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_FILTER_GROUPS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey, FilterGroupKey } from '../../../lib/constants/service-types';
import type { ServiceLog } from '../../../lib/types/service-log';

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function formatCost(cost: string): string {
  const num = parseFloat(cost);
  return isNaN(num) ? 'S$0' : `S$${num.toFixed(0)}`;
}

export default function ServiceScreen() {
  const router = useRouter();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bike } = useBike(activeBikeId);
  const { data: bikes } = useBikes();
  const { data: logsResponse, isLoading } = useServiceLogs(activeBikeId, 100);

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

  const bikeList = useMemo(
    () => bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? [],
    [bikes],
  );
  const activeBikeSlim = useMemo(
    () => (bike ? { id: bike.id, model: bike.model, year: bike.year } : undefined),
    [bike],
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeScreen
        scrollable
        bikes={bikeList}
        activeBike={activeBikeSlim}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      >
        <Skeleton height={20} className="rounded-md mb-2 w-32" />
        <Skeleton height={36} className="rounded-md mb-8 w-48" />
        <Skeleton height={46} className="rounded-xl mb-6" />
        <Skeleton height={280} className="rounded-3xl mb-6" />
        <Skeleton height={280} className="rounded-3xl" />
      </SafeScreen>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <SafeScreen
        scrollable
        bikes={bikeList}
        activeBike={activeBikeSlim}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      >
        {/* Header */}
        <View className="mb-10">
          <Text className="text-[34px] font-sans-xbold text-charcoal leading-[1.05] tracking-tight">
            Service History
          </Text>
        </View>

        <EmptyState
          title="No services logged yet"
          description={
            bike
              ? `${bike.make} ${bike.model}'s service history starts here.`
              : 'Log your first service to start tracking your maintenance history.'
          }
          actionLabel="Log a service"
          onAction={() => router.push('/add-service')}
        />
      </SafeScreen>
    );
  }

  // Main state
  return (
    <SafeScreen
      scrollable
      bikes={bikeList}
      activeBike={activeBikeSlim}
      onBikeChange={setActiveBikeId}
      onAddBikePress={handleAddBike}
    >
      {/* Header */}
      <View className="mb-10">
        <Text className="text-[34px] font-sans-xbold text-charcoal leading-[1.05] tracking-tight">
          Service History
        </Text>
      </View>

      {/* Search & filter */}
      <View className="flex-row items-center gap-3 mb-6">
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

      {/* Timeline */}
      <Section
        eyebrow="TIMELINE"
        trailing={
          <TouchableOpacity
            className="bg-yellow flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            onPress={() => setAnalyticsVisible(true)}
            activeOpacity={0.8}
          >
            <Text className="font-sans-xbold text-xs text-charcoal">
              {formatCost(totalSpend.toString())}
            </Text>
            <MaterialCommunityIcons name="trending-up" size={11} color={colors.charcoal} />
          </TouchableOpacity>
        }
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
          <View className="gap-5">
            {groupedLogs.map(({ dateKey, entries }) => (
              <View key={dateKey}>
                {/* Date marker */}
                <View className="mb-2.5 px-1">
                  <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest">
                    {formatShortDate(dateKey)}
                  </Text>
                </View>
                {/* Entries share one card per date */}
                <View className="bg-surface-card rounded-2xl overflow-hidden gap-1">
                  {entries.map((log, i) => {
                    const meta = serviceTypeToMeta(log.serviceType);
                    const subtitle = log.mileageAt
                      ? `${log.mileageAt.toLocaleString()} km`
                      : undefined;
                    return (
                        <TimelineEntry
                          key={log.id}
                          icon={meta.icon}
                          iconBg={meta.iconBg}
                          iconColor={meta.iconColor}
                          title={meta.label}
                          subtitle={subtitle}
                          cost={formatCost(log.cost)}
                          onPress={() => router.push(`/service/${log.id}`)}
                        />
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </Section>

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
    </SafeScreen>
  );
}
