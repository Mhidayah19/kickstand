import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SafeScreen } from '../components/ui/safe-screen';
import { HeroPedestal } from '../components/prediction/hero-pedestal';
import { CountdownDisplay } from '../components/prediction/countdown-display';
import { ConfidenceBadge, type ConfidenceLevel } from '../components/prediction/confidence-badge';
import { colors } from '../lib/colors';

type StateKey = 'high' | 'medium' | 'low' | 'unknown';

const STATES: { key: StateKey; label: string }[] = [
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Med' },
  { key: 'low', label: 'Low' },
  { key: 'unknown', label: 'Unknown' },
];

const STATE_CONTENT: Record<StateKey, { value: string; unit: string; supporting: string; why: string }> = {
  high: {
    value: '340',
    unit: 'KM',
    supporting: 'or 18 days — whichever comes first',
    why: 'Based on 60 days of riding data, 3 previous oil changes at MotoWorks SG, and 14% higher than average riding intensity this month.',
  },
  medium: {
    value: '340–420',
    unit: 'KM',
    supporting: "Or 16–22 days — we'll narrow this as you ride",
    why: 'Based on 42 days of riding data. We have 1 prior oil change for comparison — the range will tighten after your next service.',
  },
  low: {
    value: '~3',
    unit: 'MONTHS',
    supporting: 'Log a service to tighten this estimate.',
    why: 'Based on 18 days of riding data and no prior oil changes logged for this bike. Record your next oil change to get a personalised estimate.',
  },
  unknown: {
    value: '6,000',
    unit: 'KM',
    supporting: 'Honda recommends 6,000 km between oil changes for the CB400X.',
    why: "We don't have personal data yet — this is Honda's recommended interval straight from the CB400X service manual.",
  },
};

export default function PredictionScreen() {
  const [state, setState] = useState<StateKey>('high');
  const content = STATE_CONTENT[state];

  return (
    <SafeScreen scrollable showAppBar={false}>
      {/* Nav */}
      <View className="flex-row items-center mb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted/20 items-center justify-center active:scale-95 mr-3"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={colors.ink} />
        </Pressable>
        <Text className="text-[13px] font-sans-bold tracking-atelier uppercase text-ink">
          Prediction
        </Text>
      </View>

      {/* Header */}
      <View className="mb-6">
        <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-1">
          Engine Oil
        </Text>
        <Text className="text-[30px] font-sans-xbold text-ink tracking-tight leading-[1.05]">
          Your next oil change
        </Text>
        <Text className="text-sm font-sans-medium text-ink/55 mt-1">
          How we estimated your next service
        </Text>
      </View>

      {/* State toggle */}
      <View className="bg-muted/10 rounded-3xl p-4 mb-6">
        <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-2 px-2">
          Preview confidence state
        </Text>
        <View className="flex-row gap-1 bg-bg-2 rounded-2xl p-1">
          {STATES.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setState(s.key)}
              className={`flex-1 py-2.5 rounded-xl items-center active:opacity-70 ${state === s.key ? 'bg-ink' : ''}`}
            >
              <Text
                className={`text-[10px] font-sans-bold tracking-atelier uppercase ${
                  state === s.key ? 'text-surface' : 'text-ink/55'
                }`}
              >
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Prediction pedestal */}
      <HeroPedestal>
        <View className="p-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-muted">
              Oil Change In
            </Text>
            <ConfidenceBadge level={state as ConfidenceLevel} />
          </View>
          <CountdownDisplay
            value={content.value}
            unit={content.unit}
            supporting={content.supporting}
            size={state === 'high' ? 'lg' : state === 'medium' ? 'md' : 'sm'}
            tone="surface"
          />
          <View className="mt-5 pt-5 border-t border-white/5">
            <Text className="text-[11px] font-sans-medium text-surface/70 leading-relaxed">
              <Text className="text-yellow font-sans-bold tracking-wide uppercase text-[9px]">Why this number · </Text>
              {content.why}
            </Text>
          </View>
        </View>
      </HeroPedestal>

      {/* Historical accuracy (static placeholder) */}
      <View className="bg-muted/10 rounded-3xl p-6 mt-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55">
            Prediction accuracy
          </Text>
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-success">
            ± 40 km avg
          </Text>
        </View>
        <Text className="text-[11px] font-sans-medium text-ink/55 leading-relaxed">
          Previous oil change predictions landed within 40 km of actual service on average.
        </Text>
      </View>

      {/* Contributing factors */}
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-3 px-1">
        Contributing factors
      </Text>
      <View className="bg-muted/10 rounded-3xl overflow-hidden mb-6">
        {[
          { icon: 'speedometer', label: 'Riding intensity', value: '+14%', danger: false },
          { icon: 'map-marker-distance', label: 'Last 60 days distance', value: '1,840 km' },
          { icon: 'calendar', label: 'Days since last service', value: '14 days' },
          { icon: 'history', label: 'Your avg interval', value: '62 days' },
        ].map((f, i) => (
          <View
            key={f.label}
            className={`flex-row items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-hairline-2/20' : ''}`}
          >
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name={f.icon as any} size={18} color={colors.ink} />
              <Text className="text-[13px] font-sans-bold text-ink">{f.label}</Text>
            </View>
            <Text className={`text-[12px] font-sans-bold ${f.danger ? 'text-danger' : 'text-ink'}`}>
              {f.value}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/add-service')}
        className="w-full bg-ink rounded-full py-4 items-center active:opacity-85 mb-8"
      >
        <Text className="text-[13px] font-sans-bold tracking-wide text-surface">Log this service</Text>
      </Pressable>
    </SafeScreen>
  );
}
