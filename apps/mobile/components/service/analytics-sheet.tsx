import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { BottomSheet } from '../ui/bottom-sheet';
import { CategoryBarChart } from './category-bar-chart';
import { MonthlyBarChart } from './monthly-bar-chart';
import {
  computeByCategory,
  computeByMonth,
  computeCostPerKm,
  formatDateRangeLabel,
} from '../../lib/utils/service-analytics';
import type { ServiceLog } from '../../lib/types/service-log';

interface AnalyticsSheetProps {
  visible: boolean;
  onClose: () => void;
  logs: ServiceLog[];
  totalSpend: number;
  bikeModel: string;
  dateRange: { from: string; to: string } | null;
}

export function AnalyticsSheet({
  visible,
  onClose,
  logs,
  totalSpend,
  bikeModel,
  dateRange,
}: AnalyticsSheetProps) {
  const { height } = useWindowDimensions();

  const byCategory = useMemo(() => visible ? computeByCategory(logs) : [], [logs, visible]);
  const byMonth = useMemo(() => visible ? computeByMonth(logs) : [], [logs, visible]);
  const costPerKm = useMemo(() => visible ? computeCostPerKm(logs, totalSpend) : null, [logs, totalSpend, visible]);

  const periodLabel = dateRange ? formatDateRangeLabel(dateRange.from, dateRange.to) : 'All time';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      scrollable
      maxHeight={height * 0.78}
    >
      <Text className="font-sans-xbold text-lg text-charcoal mb-1">Maintenance Insights</Text>
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-2 mb-5">
        {bikeModel} · {periodLabel}
      </Text>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-surface-low rounded-xl p-4">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-1">
            Total Spend
          </Text>
          <Text className="font-sans-xbold text-lg text-charcoal">
            ${totalSpend.toFixed(2)}
          </Text>
        </View>
        <View className="flex-1 bg-surface-low rounded-xl p-4">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-1">
            Per 1,000 km
          </Text>
          <Text className="font-sans-xbold text-lg text-charcoal">
            {costPerKm !== null ? `$${Math.round(costPerKm)}` : '—'}
          </Text>
        </View>
      </View>

      {byCategory.length > 0 && (
        <View className="mb-6">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-2 mb-4">
            Spend by Category
          </Text>
          <CategoryBarChart data={byCategory} />
        </View>
      )}

      {byMonth.length > 0 && (
        <View className="mb-2">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-2 mb-4">
            Monthly Spend
          </Text>
          <MonthlyBarChart data={byMonth} />
        </View>
      )}

      {logs.length === 0 && (
        <Text className="font-sans-medium text-sm text-sand text-center py-8">
          No service logs in this period.
        </Text>
      )}
    </BottomSheet>
  );
}
