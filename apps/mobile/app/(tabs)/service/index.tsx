import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
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

type TimePeriod = '1M' | '6M' | '1Y' | 'All';
const TIME_PERIODS: TimePeriod[] = ['1M', '6M', '1Y', 'All'];

function getTimePeriodRange(period: TimePeriod): { from: string; to: string } | null {
  if (period === 'All') return null;
  const today = new Date();
  const to = today.toISOString().split('T')[0];
  const from = new Date(today);
  switch (period) {
    case '1M':
      from.setMonth(from.getMonth() - 1);
      break;
    case '6M':
      from.setMonth(from.getMonth() - 6);
      break;
    case '1Y':
      from.setFullYear(from.getFullYear() - 1);
      break;
  }
  return { from: from.toISOString().split('T')[0], to };
}

export default function ServiceScreen() {
  const router = useRouter();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bike } = useBike(activeBikeId);
  const { data: bikes } = useBikes();
  const { data: logsResponse, isLoading } = useServiceLogs(activeBikeId, 100);

  const [selectedFilter, setSelectedFilter] = useState<FilterGroupKey>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('All');
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
    setTimePeriod('All');
    setSearchExpanded(false);
  }, [activeBikeId]);

  const handleTimePeriodChange = useCallback((period: TimePeriod) => {
    setTimePeriod(period);
    setDateRange(getTimePeriodRange(period));
  }, []);

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

  // Monthly cost series (up to 12 buckets), based on dateFilteredLogs.
  const monthlyCosts = useMemo(() => {
    if (dateFilteredLogs.length === 0) return [] as number[];
    const buckets = new Map<string, number>();
    for (const log of dateFilteredLogs) {
      const key = log.date.slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + (parseFloat(log.cost) || 0));
    }
    const sorted = Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b));
    return sorted.slice(-12).map(([, v]) => v);
  }, [dateFilteredLogs]);

  const sparkPoints = useMemo(() => {
    if (monthlyCosts.length < 2) return [] as { x: number; y: number }[];
    const maxY = Math.max(...monthlyCosts, 1);
    return monthlyCosts.map((v, i) => ({
      x: (i / (monthlyCosts.length - 1)) * 320,
      y: 92 - (v / maxY) * 84,
    }));
  }, [monthlyCosts]);

  const sparkLinePath = useMemo(
    () => sparkPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
    [sparkPoints],
  );

  const sparkFillPath = useMemo(
    () => (sparkPoints.length > 1 ? `${sparkLinePath} L 320 96 L 0 96 Z` : ''),
    [sparkPoints, sparkLinePath],
  );

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

  return (
    <View className="flex-1 bg-bg">
      <TopBar
        bike={`${bike?.model ?? 'Garage'}${bike?.year ? ` · ${bike.year}` : ''}`}
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
            <Text className="font-display text-[18px] text-muted">S$</Text>
            <Text
              className="font-display text-[72px] text-ink flex-shrink"
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
              PAST {timePeriod === 'All' ? 'ALL TIME' : timePeriod}
            </Text>
          </View>
        </View>

        {/* Sparkline */}
        {sparkPoints.length > 1 ? (
          <View className="px-5 pt-4 pb-2">
            <Svg viewBox="0 0 320 96" width="100%" height={96}>
              <Defs>
                <LinearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#F2D06B" stopOpacity={0.3} />
                  <Stop offset="100%" stopColor="#F2D06B" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={sparkFillPath} fill="url(#spark-fill)" />
              <Path d={sparkLinePath} stroke="#F2D06B" strokeWidth={1.5} fill="none" />
              {sparkPoints.map((p, i) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === sparkPoints.length - 1 ? 3 : 1.5}
                  fill={i === sparkPoints.length - 1 ? '#F2D06B' : '#1A1A1A'}
                  opacity={i === sparkPoints.length - 1 ? 1 : 0.4}
                />
              ))}
            </Svg>
          </View>
        ) : null}

        {/* Segmented time period control */}
        <View className="flex-row bg-hairline rounded-xl p-[3px] mx-5 mt-2">
          {TIME_PERIODS.map((p) => (
            <Pressable
              key={p}
              className={`flex-1 py-2.5 rounded-[10px] items-center ${timePeriod === p ? 'bg-surface-card' : ''}`}
              onPress={() => handleTimePeriodChange(p)}
              style={timePeriod === p ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 } : undefined}
            >
              <Text className={`font-mono text-[11px] tracking-[0.08em] uppercase ${timePeriod === p ? 'text-ink' : 'text-muted'}`}>
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats row */}
        <View className="flex-row mt-2 border-t border-b border-hairline" style={{ columnGap: 1, backgroundColor: 'rgba(26,26,26,0.09)' }}>
          <StatCell value={String(serviceCount)} label="Services" />
          <StatCell value={avgCost > 0 ? `S$${Math.round(avgCost)}` : '—'} label="Avg cost" />
          <StatCell value={costPerKm !== null ? `S$${Math.round(costPerKm)}` : 'N/A'} label="Per 1K KM" />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 6, paddingTop: 16 }}
        >
          {(Object.keys(SERVICE_FILTER_GROUPS) as FilterGroupKey[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setSelectedFilter(f)}
              className={`px-3 py-2 rounded-full border ${
                selectedFilter === f ? 'bg-ink border-ink' : 'bg-transparent border-hairline-2'
              }`}
            >
              <Text
                className={`font-mono text-[10px] tracking-[0.12em] uppercase ${
                  selectedFilter === f ? 'text-bg' : 'text-ink-2'
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

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
        <View className="px-5 pt-2 pb-24">
          {filteredLogs.length === 0 ? (
            <View className="items-center justify-center py-16 gap-4">
              <Text className="font-sans-medium text-[14px] text-muted text-center">
                No services match your filters
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedFilter('All');
                  setDateRange(null);
                  setTimePeriod('All');
                  setSearchQuery('');
                  setSearchExpanded(false);
                }}
                hitSlop={8}
              >
                <Text className="font-sans-semibold text-[13px] text-ink">Clear filters</Text>
              </Pressable>
            </View>
          ) : (
            <View className="relative">
              <View
                pointerEvents="none"
                className="bg-hairline-2"
                style={{ position: 'absolute', top: 22, bottom: 10, left: 72, width: 1 }}
              />
              {groupedLogs.map((g, gi) => {
                const d = new Date(g.dateKey);
                const dateDay = String(d.getDate()).padStart(2, '0');
                const dateMonth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                const groupTotal = g.entries.reduce((s, e) => s + (parseFloat(e.cost) || 0), 0);
                const isMulti = g.entries.length > 1;
                const isLast = gi === groupedLogs.length - 1;
                return (
                  <View
                    key={g.dateKey}
                    className="flex-row gap-3"
                    style={{ marginBottom: isLast ? 0 : 20 }}
                  >
                    <View className="items-center w-14 flex-shrink-0 pt-1">
                      <Text className="font-display text-[26px] leading-[1.1] text-ink text-center">
                        {dateDay}
                      </Text>
                      <Text className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted mt-1.5 text-center">
                        {dateMonth}
                      </Text>
                      {isMulti ? (
                        <View className="mt-2 px-1.5 py-[3px] rounded-full bg-hairline">
                          <Text
                            className="font-mono text-[9px] text-ink"
                            style={{ fontVariant: ['tabular-nums'] }}
                          >
                            S${Math.round(groupTotal)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="flex-1 gap-2 pt-1 min-w-0">
                      {g.entries.map((e, ei) => {
                        const meta = serviceTypeToMeta(e.serviceType);
                        const subParts: string[] = [];
                        if (e.mileageAt) subParts.push(`${e.mileageAt.toLocaleString()} KM`);
                        if (e.description) subParts.push(e.description);
                        const isFirstEver = gi === 0 && ei === 0;
                        const isGroupStart = ei === 0;
                        return (
                          <View key={e.id} className="flex-row items-start gap-2.5">
                            <View
                              className={`w-2.5 h-2.5 rounded-full mt-[14px] border-2 ${
                                isFirstEver
                                  ? 'bg-yellow border-yellow'
                                  : isGroupStart
                                    ? 'bg-ink border-ink'
                                    : 'bg-bg border-ink-2'
                              }`}
                              style={{ zIndex: 1 }}
                            />
                            <Pressable
                              onPress={() => router.push(`/service/${e.id}` as any)}
                              className="flex-1 bg-bg-2 rounded-[14px] px-3.5 py-2.5 flex-row items-center gap-2.5 min-w-0"
                            >
                              <Icon name={serviceTypeIcon(e.serviceType)} size={18} stroke="#1A1A1A" />
                              <View className="flex-1 min-w-0">
                                <Text className="font-sans-semibold text-[13px] tracking-[-0.01em] text-ink" numberOfLines={1}>
                                  {meta.label}
                                </Text>
                                {subParts.length > 0 ? (
                                  <Text className="font-mono text-[10px] text-muted mt-0.5 tracking-[0.04em]" numberOfLines={1}>
                                    {subParts.join(' · ')}
                                  </Text>
                                ) : null}
                              </View>
                              <Text className="font-mono text-[12px] text-ink" style={{ fontVariant: ['tabular-nums'] }}>
                                S${Math.round(parseFloat(e.cost) || 0)}
                              </Text>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
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
          if (range) {
            setDateRange(range);
            setTimePeriod('All');
          }
          setFilterSheetVisible(false);
        }}
      />
    </View>
  );
}
