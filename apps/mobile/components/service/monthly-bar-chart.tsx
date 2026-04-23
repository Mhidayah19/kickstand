import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../lib/colors';
import { MONTH_ABBR } from '../../lib/utils/service-analytics';

interface MonthlyBarChartProps {
  data: { month: string; total: number }[];
}

function formatMonth(key: string): string {
  const monthIdx = parseInt(key.slice(5, 7), 10) - 1;
  return MONTH_ABBR[monthIdx] ?? key;
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  if (data.length === 0) return null;
  const maxTotal = Math.max(...data.map((d) => d.total));
  const BAR_MAX_HEIGHT = 64;

  return (
    <View className="flex-row items-end gap-2" style={{ height: BAR_MAX_HEIGHT + 24 }}>
      {data.map((item, idx) => {
        const barHeight = maxTotal > 0 ? Math.max((item.total / maxTotal) * BAR_MAX_HEIGHT, 2) : 2;
        const isLast = idx === data.length - 1;
        const isPeak = item.total === maxTotal && !isLast;
        const barColor = isLast
          ? colors.yellow
          : isPeak
          ? colors.ink
          : colors.bg2;
        const textColor = isLast || isPeak ? colors.ink : colors.muted;

        return (
          <View key={item.month} className="flex-1 items-center gap-1">
            <View
              style={{
                height: barHeight,
                width: '100%',
                backgroundColor: barColor,
                borderRadius: 4,
              }}
            />
            <Text style={{ fontSize: 9, fontWeight: '700', color: textColor }}>
              {formatMonth(item.month)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
