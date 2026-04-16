import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, StyleSheet } from 'react-native';
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
import { computeCostPerKm } from '../../../lib/utils/service-analytics';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_FILTER_GROUPS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey, FilterGroupKey } from '../../../lib/constants/service-types';
import type { ServiceLog } from '../../../lib/types/service-log';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function formatCost(cost: string | number): string {
  const num = typeof cost === 'number' ? cost : parseFloat(cost);
  return isNaN(num) ? 'S$0' : `S$${num.toFixed(0)}`;
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

function StatCard({ value, label, dim = false }: { value: string; label: string; dim?: boolean }) {
  return (
    <View className="flex-1 bg-sand/10 rounded-2xl px-4 py-3">
      <Text
        className={`font-sans-xbold text-lg ${dim ? 'text-charcoal/25' : 'text-charcoal'}`}
        style={styles.tabularNums}
      >
        {value}
      </Text>
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mt-0.5">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabularNums: { fontVariant: ['tabular-nums'] },
  heroSpend: { fontSize: 60, fontVariant: ['tabular-nums'] },
  timelineCard: {
    shadowColor: colors.charcoal,
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 1,
  },
});

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const periodLabel = useMemo(() => {
    if (timePeriod === 'All') return `${logs.length} service${logs.length !== 1 ? 's' : ''} all time`;
    const count = dateFilteredLogs.length;
    const labels: Record<string, string> = { '1M': 'past month', '6M': 'past 6 months', '1Y': 'past year' };
    return `${count} service${count !== 1 ? 's' : ''} ${labels[timePeriod]}`;
  }, [timePeriod, logs.length, dateFilteredLogs.length]);

  const groupedLogs = useMemo(() => {
    const map = new Map<string, ServiceLog[]>();
    for (const log of filteredLogs) {
      const key = log.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries()).map(([dateKey, entries]) => ({ dateKey, entries }));
  }, [filteredLogs]);

  const hasActiveFilters = selectedFilter !== 'All';
  const activeFilterCount = selectedFilter !== 'All' ? 1 : 0;

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
    <SafeScreen
      scrollable
      bikes={bikeList}
      activeBike={activeBikeSlim}
      onBikeChange={setActiveBikeId}
      onAddBikePress={handleAddBike}
    >
      <View className="mb-6">
        <Text className="text-[20px] font-sans-xbold text-charcoal tracking-tight mb-3">
          Service History
        </Text>
        <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-1">
          TOTAL SPEND
        </Text>
        <Text
          className="font-sans-xbold text-charcoal leading-none"
          style={styles.heroSpend}
        >
          {formatCost(periodSpend)}
        </Text>
        <Text className="font-sans-medium text-sm text-sand mt-1">
          {periodLabel}
        </Text>
      </View>

      <View className="bg-surface-low rounded-2xl flex-row p-1 mb-5">
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => handleTimePeriodChange(period)}
            className={`flex-1 items-center justify-center rounded-xl py-2.5 ${
              timePeriod === period ? 'bg-charcoal' : ''
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`font-sans-bold text-sm ${
                timePeriod === period ? 'text-white' : 'text-charcoal/70'
              }`}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row gap-3 mb-8">
        <StatCard value={String(serviceCount)} label="SERVICES" />
        <StatCard value={avgCost > 0 ? formatCost(avgCost) : '—'} label="AVG COST" />
        <StatCard value={costPerKm !== null ? formatCost(costPerKm) : 'N/A'} label="PER 1K KM" dim={costPerKm === null} />
      </View>

      <Section
        eyebrow="TIMELINE"
        trailing={
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={toggleSearch}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={searchExpanded ? 'close' : 'magnify'}
                size={18}
                color={colors.charcoal + '8C'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setFilterSheetVisible(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={18}
                color={colors.charcoal + '8C'}
              />
              {hasActiveFilters && (
                <View className="bg-yellow rounded-full w-4 h-4 items-center justify-center ml-1">
                  <Text className="font-sans-xbold text-charcoal" style={{ fontSize: 9 }}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAnalyticsVisible(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="chart-bar"
                size={18}
                color={colors.charcoal + '8C'}
              />
            </TouchableOpacity>
          </View>
        }
      >
        {searchExpanded && (
          <View className="mb-4">
            <ServiceSearchBar
              key={activeBikeId ?? 'none'}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </View>
        )}

        {filteredLogs.length === 0 ? (
          <View className="items-center justify-center py-16 gap-4">
            <Text className="font-sans-medium text-sm text-sand text-center">
              No services match your filters
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedFilter('All');
                setDateRange(null);
                setTimePeriod('All');
                setSearchQuery('');
                setSearchExpanded(false);
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
                <View
                  className="bg-sand/10 rounded-2xl overflow-hidden gap-1"
                  style={styles.timelineCard}
                >
                  {entries.map((log) => {
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
    </SafeScreen>
  );
}
