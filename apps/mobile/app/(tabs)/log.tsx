import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ui/screen-header';
import { FilterChips } from '../../components/ui/filter-chips';
import { TimelineEntry } from '../../components/ui/timeline-entry';
import { TopAppBar } from '../../components/ui/top-app-bar';
import { Skeleton } from '../../components/ui/skeleton';
import { useAllServiceLogs } from '../../lib/api/use-service-logs';
import { serviceTypeToMeta } from '../../lib/service-type-meta';

const FILTER_OPTIONS = ['All', 'Maintenance', 'Repairs', 'Performance'];

const FILTER_CATEGORIES: Record<string, Set<string>> = {
  Maintenance: new Set(['oil_change', 'air_filter', 'spark_plugs', 'battery', 'coolant', 'general_service']),
  Repairs:     new Set(['brake_pads', 'brake_fluid', 'clutch', 'fork_oil']),
  Performance: new Set(['chain_adjustment', 'chain_replacement', 'tire_front', 'tire_rear', 'valve_clearance']),
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(dateStr: string): string {
  const [year, monthStr, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(monthStr) - 1]}, ${year}`;
}

export default function LogScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { data: logsData, isLoading } = useAllServiceLogs(50);
  const allLogs = logsData?.data ?? [];

  const filteredLogs = useMemo(() => {
    if (selectedFilter === 'All') return allLogs;
    const category = FILTER_CATEGORIES[selectedFilter];
    return allLogs.filter(log => category?.has(log.serviceType));
  }, [allLogs, selectedFilter]);

  const totalCost = useMemo(
    () => filteredLogs.reduce((sum, log) => sum + parseFloat(log.cost), 0),
    [filteredLogs],
  );

  const formattedCost = `$${totalCost.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar />

      <View className="px-6" style={{ paddingTop: 80 }}>
        <ScreenHeader title="Service History" size="md" />
        <View className="bg-yellow self-start px-4 py-2 rounded-xl mb-6">
          <Text className="font-sans-xbold text-lg text-charcoal">{formattedCost}</Text>
        </View>
      </View>

      <View className="mb-4">
        <FilterChips
          options={FILTER_OPTIONS}
          selected={selectedFilter}
          onSelect={setSelectedFilter}
          wrap={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 128, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="gap-12">
            <Skeleton height={120} className="rounded-2xl" />
            <Skeleton height={120} className="rounded-2xl" />
            <Skeleton height={120} className="rounded-2xl" />
          </View>
        ) : filteredLogs.length === 0 ? (
          <View className="items-center py-16">
            <Text className="font-sans-bold text-base text-charcoal mb-2">
              No service logs yet
            </Text>
            <Text className="font-sans-medium text-sm text-sand text-center">
              Log a service from any bike in your garage.
            </Text>
          </View>
        ) : (
          <View className="relative">
            <View
              className="absolute bg-sand/30"
              style={{ left: 16, top: 0, bottom: 0, width: 2 }}
            />
            {filteredLogs.map((log) => {
              const meta = serviceTypeToMeta(log.serviceType);
              return (
                <TimelineEntry
                  key={log.id}
                  date={formatDate(log.date)}
                  title={meta.label}
                  cost={`$${parseFloat(log.cost).toFixed(2)}`}
                  icon={meta.icon}
                  color={meta.color}
                  tags={[{ label: meta.label }]}
                  quote={log.description || undefined}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
