import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Path, Stop, Circle } from 'react-native-svg';

import { SafeScreen } from '../../components/ui/safe-screen';
import { HeroPedestal } from '../../components/prediction/hero-pedestal';
import { CountdownDisplay } from '../../components/prediction/countdown-display';
import { ListCard } from '../../components/ui/list-card';
import { colors } from '../../lib/colors';

// v1: static data per slug. Batch 10 replaces with real data.
const CATEGORY_DATA: Record<string, {
  label: string;
  meta: string;
  total: string;
  perKm: string;
  vsAvg: string;
  nextDue: string;
  purchases: { name: string; shop: string; days: number; amount: string }[];
}> = {
  tyres: {
    label: 'Tyres',
    meta: 'S$ 860 across 3 services',
    total: '860',
    perKm: 'S$ 0.069',
    vsAvg: '-12%',
    nextDue: '2,110 km',
    purchases: [
      { name: 'Rear tyre — Michelin Road 6', shop: 'Ah Beng Tyres', days: 32, amount: 'S$ 320' },
      { name: 'Front tyre — Michelin Road 6', shop: 'Ah Beng Tyres', days: 94, amount: 'S$ 290' },
      { name: 'Both tyres + alignment', shop: 'MotoWorks SG', days: 334, amount: 'S$ 250' },
    ],
  },
};

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const data = CATEGORY_DATA[slug as string] ?? CATEGORY_DATA.tyres;

  return (
    <SafeScreen scrollable showAppBar={false}>
      <View className="flex-row items-center mb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted/20 items-center justify-center active:scale-95 mr-3"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.ink} />
        </Pressable>
        <Text className="text-[13px] font-sans-bold tracking-atelier uppercase text-ink">
          Category
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-1">
          Category · Last 12 months
        </Text>
        <Text className="text-[30px] font-sans-xbold text-ink tracking-tight leading-[1.05]">
          {data.label}
        </Text>
        <Text className="text-sm font-sans-medium text-ink/55 mt-1">{data.meta}</Text>
      </View>

      <HeroPedestal>
        <View className="p-8">
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-muted mb-3">
            12-month spend
          </Text>
          <CountdownDisplay value={data.total} unit="SGD" size="md" tone="surface" />
          <View className="flex-row items-center justify-between pt-4 border-t border-white/5 mt-4">
            <MetricCell label="Per km" value={data.perKm} />
            <MetricCell label="Vs avg SG rider" value={data.vsAvg} valueColor="text-success" />
            <MetricCell label="Next due" value={data.nextDue} />
          </View>
        </View>
      </HeroPedestal>

      {/* 12-month trend */}
      <View className="bg-muted/10 rounded-3xl p-6 mt-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55">
            12-month trend
          </Text>
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55">
            SGD
          </Text>
        </View>
        <Svg width="100%" height={96} viewBox="0 0 320 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="tyregrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.muted} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={colors.muted} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path
            d="M 0 80 L 30 75 L 60 78 L 90 40 L 120 42 L 150 45 L 180 72 L 210 68 L 240 20 L 270 25 L 300 30 L 320 28 L 320 100 L 0 100 Z"
            fill="url(#tyregrad)"
          />
          <Path
            d="M 0 80 L 30 75 L 60 78 L 90 40 L 120 42 L 150 45 L 180 72 L 210 68 L 240 20 L 270 25 L 300 30 L 320 28"
            fill="none"
            stroke={colors.ink}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Circle cx="90" cy="40" r="4" fill={colors.yellow} />
          <Circle cx="240" cy="20" r="4" fill={colors.yellow} />
          <Circle cx="320" cy="28" r="4" fill={colors.yellow} />
        </Svg>
      </View>

      {/* Purchases list */}
      <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-3">
        Purchases
      </Text>
      <View className="mb-8">
        {data.purchases.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View className="h-px bg-hairline" />}
            <ListCard
              icon="receipt"
              title={p.name}
              subtitle={`${p.shop} · ${p.days} days ago`}
              trailing={p.amount}
            />
          </React.Fragment>
        ))}
      </View>
    </SafeScreen>
  );
}

function MetricCell({
  label,
  value,
  valueColor = 'text-surface',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View>
      <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-muted mb-1">
        {label}
      </Text>
      <Text className={`text-[13px] font-sans-bold ${valueColor}`}>{value}</Text>
    </View>
  );
}
