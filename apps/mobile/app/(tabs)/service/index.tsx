import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TopAppBar } from '../../../components/ui/top-app-bar';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { SwipeableTimelineEntry } from '../../../components/ui/swipeable-timeline-entry';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { ServiceSearchBar } from '../../../components/service/service-search-bar';
import { AnalyticsSheet } from '../../../components/service/analytics-sheet';
import { FilterSheet } from '../../../components/service/filter-sheet';
import { useServiceLogs, useDeleteServiceLog } from '../../../lib/api/use-service-logs';
import { useBike, useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ICONS,
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

function mapLogToTimeline(log: ServiceLog) {
  const key = log.serviceType as ServiceTypeKey;
  return {
    date: formatDate(log.date),
    title: SERVICE_TYPE_LABELS[key] ?? log.serviceType,
    cost: formatCost(log.cost),
    icon: (SERVICE_TYPE_ICONS[key] ?? 'wrench') as string,
    color: SERVICE_TYPE_COLORS[key] ?? ('charcoal' as const),
    quote: log.description || undefined,
    parts: log.parts ?? undefined,
  };
}

export default function ServiceScreen() {
  const router = useRouter();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bike } = useBike(activeBikeId);
  const { data: bikes } = useBikes();
  const { data: logsResponse, isLoading } = useServiceLogs(activeBikeId, 100);

  const [selectedFilter, setSelectedFilter] = useState<FilterGroupKey>('All');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(null);
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

  const hasActiveFilters = selectedFilter !== 'All' || dateRange !== null;
  const activeFilterCount = (selectedFilter !== 'All' ? 1 : 0) + (dateRange ? 1 : 0);

  const deleteLog = useDeleteServiceLog(activeBikeId);

  const handleDeleteLog = useCallback((logId: string, serviceLabel: string) => {
    setPendingDelete({ id: logId, label: serviceLabel });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (pendingDelete) deleteLog.mutate(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, deleteLog.mutate]);

  const handleCancelDelete = useCallback(() => setPendingDelete(null), []);

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
          <ServiceSearchBar
            key={activeBikeId ?? 'none'}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        )}
      </View>

      {logs.length > 0 && (
        <View className="px-6 mt-3 mb-4">
          <TouchableOpacity
            className={`self-start flex-row items-center gap-2 px-4 py-2 rounded-full ${
              hasActiveFilters ? 'bg-charcoal' : 'bg-surface-low'
            }`}
            onPress={() => setFilterSheetVisible(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={14}
              color={hasActiveFilters ? colors.white : colors.sand}
            />
            <Text
              className={`font-sans-bold text-sm ${
                hasActiveFilters ? 'text-white' : 'text-sand'
              }`}
            >
              {hasActiveFilters ? `Filters · ${activeFilterCount}` : 'Filter'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
              {filteredLogs.map((log) => {
                const props = mapLogToTimeline(log);
                return (
                  <SwipeableTimelineEntry
                    key={log.id}
                    {...props}
                    onPress={() => router.push(`/service/${log.id}`)}
                    onDelete={() => handleDeleteLog(log.id, props.title)}
                    onEdit={() =>
                      router.push(`/edit-service?logId=${log.id}&bikeId=${activeBikeId}`)
                    }
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <ConfirmationDialog
        visible={!!pendingDelete}
        title="Delete Service Log"
        body={`Are you sure you want to delete this ${pendingDelete?.label ?? ''} log?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

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
