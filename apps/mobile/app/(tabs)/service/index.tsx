import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/ui/empty-state';
import { ServiceSearchBar } from '../../../components/service/service-search-bar';
import { AnalyticsSheet } from '../../../components/service/analytics-sheet';
import { FilterSheet } from '../../../components/service/filter-sheet';
import { TopBar, StatCell, Icon, BikeSwitcher } from '../../../components/ui/atelier';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBike, useBikes } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../lib/service-type-meta';
import { computeCostPerKm } from '../../../lib/utils/service-analytics';
import { serviceTypeIcon } from '../../../lib/service-icon';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_FILTER_GROUPS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey, FilterGroupKey } from '../../../lib/constants/service-types';
import type { ServiceLog } from '../../../lib/types/service-log';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ACCENT_SERVICE_TYPES = new Set<string>(['oil_change', 'tire_front', 'tire_rear']);
const MONTH_FULL: Record<number, string> = {
  0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June',
  6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December',
};

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
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [bikeSwitcherOpen, setBikeSwitcherOpen] = useState(false);

  const logs = logsResponse?.data ?? [];

  useEffect(() => {
    setSearchQuery('');
    setDateRange(null);
    setSelectedFilter('All');
    setSearchExpanded(false);
  }, [activeBikeId]);

  const toggleSearch = useCallback(() => {
    if (searchExpanded) {
      setSearchQuery('');
      setSearchExpanded(false);
    } else {
      setSearchExpanded(true);
    }
  }, [searchExpanded]);

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
      const parts = (log.parts?.join(' ') ?? '').toLowerCase();
      return label.includes(q) || desc.includes(q) || parts.includes(q);
    });
  }, [categoryFilteredLogs, searchQuery]);

  const periodSpend = useMemo(
    () => dateFilteredLogs.reduce((acc, log) => acc + (parseFloat(log.cost) || 0), 0),
    [dateFilteredLogs],
  );

  const serviceCount = dateFilteredLogs.length;

  const avgCost = useMemo(
    () => (serviceCount > 0 ? periodSpend / serviceCount : 0),
    [periodSpend, serviceCount],
  );

  const costPerKm = useMemo(
    () => computeCostPerKm(dateFilteredLogs, periodSpend),
    [dateFilteredLogs, periodSpend],
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

  const rangeLabel = dateRange ? 'FILTERED' : 'ALL TIME';

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

  if (isLoading) {
    return (
      <SafeScreen
        scrollable
        bikes={bikeList}
        activeBike={activeBikeSlim}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      >
        <Skeleton height={12} className="rounded-md mb-2 w-24" />
        <Skeleton height={52} className="rounded-md mb-2 w-40" />
        <Skeleton height={14} className="rounded-md mb-6 w-36" />
        <Skeleton height={44} className="rounded-2xl mb-5" />
        <View className="flex-row gap-3 mb-8">
          <Skeleton height={72} className="rounded-2xl flex-1" />
          <Skeleton height={72} className="rounded-2xl flex-1" />
          <Skeleton height={72} className="rounded-2xl flex-1" />
        </View>
        <Skeleton height={12} className="rounded-md mb-4 w-20" />
        <Skeleton height={280} className="rounded-3xl mb-6" />
        <Skeleton height={280} className="rounded-3xl" />
      </SafeScreen>
    );
  }

  if (isEmpty) {
    return (
      <SafeScreen
        scrollable
        bikes={bikeList}
        activeBike={activeBikeSlim}
        onBikeChange={setActiveBikeId}
        onAddBikePress={handleAddBike}
      >
        <View className="mb-10">
          <Text className="text-[34px] font-sans-xbold text-ink leading-[1.05] tracking-tight">
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

  return (
    <View className="flex-1 bg-bg">
      <TopBar
        bike={bike?.model ?? 'Garage'}
        unread={0}
        onBikePress={() => setBikeSwitcherOpen(true)}
        onBellPress={() => router.push('/notifications' as any)}
      />

      <BikeSwitcher
        visible={bikeSwitcherOpen}
        onClose={() => setBikeSwitcherOpen(false)}
        bikes={bikes ?? []}
        activeBikeId={activeBikeId}
        onSelect={setActiveBikeId}
        onAddBike={() => router.push('/add-bike')}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero spend */}
        <View className="px-5 pt-6">
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-2.5">
            Service History · Total Spend
          </Text>
          <View className="flex-row items-baseline gap-2.5 mb-2">
            <Text className="font-display text-[18px] text-muted tracking-[-0.01em]">S$</Text>
            <Text
              className="font-display text-[72px] text-ink flex-shrink tracking-[-0.045em]"
              style={{ fontVariant: ['tabular-nums'], lineHeight: 76 }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {Math.round(periodSpend).toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="font-mono text-[11px] tracking-[0.04em] text-muted">
              {serviceCount} SERVICE{serviceCount !== 1 ? 'S' : ''}
            </Text>
            <Text className="font-mono text-[11px] text-muted">·</Text>
            <Text className="font-mono text-[11px] tracking-[0.04em] text-ink">
              {rangeLabel}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mt-5 border-t border-b border-hairline" style={{ columnGap: 1, backgroundColor: 'rgba(26,26,26,0.09)' }}>
          <StatCell value={String(serviceCount)} label="Services" />
          <StatCell value={avgCost > 0 ? `S$${Math.round(avgCost)}` : '—'} label="Avg cost" />
          <StatCell value={costPerKm !== null ? `S$${Math.round(costPerKm)}` : 'N/A'} label="Per 1K KM" />
        </View>

        {/* Timeline header */}
        <View className="px-5 pt-5 flex-row justify-between items-center">
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">Timeline</Text>
          <View className="flex-row gap-2.5">
            <Pressable onPress={toggleSearch} hitSlop={8}>
              <Icon name={searchExpanded ? 'close' : 'search'} size={16} stroke="#7A756C" />
            </Pressable>
            <Pressable onPress={() => setFilterSheetVisible(true)} hitSlop={8}>
              <Icon name="filter" size={16} stroke="#7A756C" />
            </Pressable>
            <Pressable onPress={() => setAnalyticsVisible(true)} hitSlop={8}>
              <Icon name="gauge" size={16} stroke="#7A756C" />
            </Pressable>
          </View>
        </View>

        {/* Search bar (when expanded) */}
        {searchExpanded ? (
          <View className="mx-5 mt-3">
            <ServiceSearchBar
              key={activeBikeId ?? 'none'}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </View>
        ) : null}

        {/* Timeline groups */}
        <View className="px-5 pt-3 pb-24">
          {filteredLogs.length === 0 ? (
            <View className="items-center justify-center py-16 gap-4">
              <Text className="font-sans-medium text-[14px] text-muted text-center">
                No services match your filters
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedFilter('All');
                  setDateRange(null);
                  setSearchQuery('');
                  setSearchExpanded(false);
                }}
                hitSlop={8}
              >
                <Text className="font-sans-semibold text-[13px] text-ink">Clear filters</Text>
              </Pressable>
            </View>
          ) : (
            groupedLogs.map((g) => {
              const d = new Date(g.dateKey);
              const monthFull = MONTH_FULL[d.getMonth()];
              const dateDay = String(d.getDate()).padStart(2, '0');
              const year = d.getFullYear();
              const groupKm = g.entries.find((e) => e.mileageAt)?.mileageAt;
              return (
                <View key={g.dateKey} style={{ marginBottom: 20 }}>
                  {/* Date group header */}
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                      {monthFull} {dateDay}, {year}
                    </Text>
                    {groupKm ? (
                      <Text
                        className="font-mono text-[10px] tracking-[0.04em] text-muted"
                        style={{ fontVariant: ['tabular-nums'] }}
                      >
                        {groupKm.toLocaleString()} km
                      </Text>
                    ) : null}
                  </View>

                  {/* Cards */}
                  <View className="gap-2">
                    {g.entries.map((e) => {
                      const meta = serviceTypeToMeta(e.serviceType);
                      const accent = ACCENT_SERVICE_TYPES.has(e.serviceType);
                      const subParts: string[] = [];
                      if (e.description) subParts.push(e.description);
                      if (e.parts && e.parts.length > 0) subParts.push(e.parts.join(' · '));
                      const subtitle = subParts.join(' · ');
                      const cost = Math.round(parseFloat(e.cost) || 0);
                      return (
                        <Pressable
                          key={e.id}
                          onPress={() => router.push(`/service/${e.id}` as any)}
                          className="flex-row items-center bg-surface rounded-[16px]"
                          style={{
                            borderWidth: 1,
                            borderColor: 'rgba(26,26,26,0.09)',
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            columnGap: 12,
                            shadowColor: '#1A1A1A',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                          }}
                        >
                          {/* Icon badge */}
                          <View
                            className="items-center justify-center"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              backgroundColor: accent ? 'rgba(242,208,107,0.22)' : '#EBE8DF',
                              borderWidth: 1,
                              borderColor: accent ? 'rgba(242,208,107,0.45)' : 'rgba(26,26,26,0.09)',
                            }}
                          >
                            <Icon name={serviceTypeIcon(e.serviceType)} size={18} stroke="#1A1A1A" />
                          </View>

                          {/* Main info */}
                          <View className="flex-1 min-w-0">
                            <Text
                              className="font-sans-bold text-[13px] tracking-[-0.01em] text-ink"
                              style={{ lineHeight: 16 }}
                              numberOfLines={1}
                            >
                              {meta.label}
                            </Text>
                            {subtitle ? (
                              <Text
                                className="font-mono text-[10px] tracking-[0.04em] text-muted mt-[3px]"
                                numberOfLines={1}
                              >
                                {subtitle}
                              </Text>
                            ) : null}
                          </View>

                          {/* Right: price + chevron */}
                          <View className="flex-row items-center" style={{ columnGap: 6 }}>
                            <View
                              className="flex-row items-baseline"
                              style={{
                                borderRadius: 999,
                                paddingHorizontal: 9,
                                paddingVertical: 3,
                                borderWidth: 1,
                                columnGap: 3,
                                backgroundColor: accent ? 'rgba(242,208,107,0.22)' : '#F4F2EC',
                                borderColor: accent ? 'rgba(242,208,107,0.4)' : 'rgba(26,26,26,0.16)',
                              }}
                            >
                              <Text
                                className="font-mono-semibold text-[9px] tracking-[0.06em] uppercase"
                                style={{ color: accent ? '#1A1A1A' : '#7A756C' }}
                              >
                                S$
                              </Text>
                              <Text
                                className="font-mono-semibold text-[12px] text-ink"
                                style={{ fontVariant: ['tabular-nums'] }}
                              >
                                {cost}
                              </Text>
                            </View>
                            <Icon name="chevron" size={13} stroke="#7A756C" />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <AnalyticsSheet
        visible={analyticsVisible}
        onClose={() => setAnalyticsVisible(false)}
        logs={dateFilteredLogs}
        totalSpend={periodSpend}
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
          setDateRange(range ?? null);
          setFilterSheetVisible(false);
        }}
      />
    </View>
  );
}
