import React from 'react';
import { View, Text } from 'react-native';
import type { FilterGroupKey } from '../../lib/constants/service-types';
import { colors } from '../../lib/colors';

interface CategoryBarChartProps {
  data: { group: FilterGroupKey; total: number }[];
}

const CATEGORY_COLORS: Partial<Record<FilterGroupKey, string>> = {
  'Oil & Fluids': colors.yellow,
  Brakes: colors.danger,
};

function formatCostShort(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  if (data.length === 0) return null;
  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <View className="gap-3">
      {data.map((item) => {
        const widthPercent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
        const barColor = CATEGORY_COLORS[item.group] ?? colors.ink;
        return (
          <View key={item.group} className="flex-row items-center gap-2">
            <Text
              className="font-sans-medium text-xs text-ink text-right"
              style={{ width: 76 }}
              numberOfLines={1}
            >
              {item.group}
            </Text>
            <View className="flex-1 bg-bg-2 rounded h-2 overflow-hidden">
              <View
                style={{ width: `${widthPercent}%`, backgroundColor: barColor }}
                className="h-full rounded"
              />
            </View>
            <Text className="font-sans-bold text-xs text-muted" style={{ width: 40, textAlign: 'right' }}>
              {formatCostShort(item.total)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
