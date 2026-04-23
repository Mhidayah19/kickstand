import { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SafeScreen } from '../components/ui/safe-screen';
import { useBikes } from '../lib/api/use-bikes';
import { useBikeStore } from '../lib/store/bike-store';
import { colors } from '../lib/colors';

export default function QuickLogScreen() {
  const { data: bikes } = useBikes();
  const { activeBikeId } = useBikeStore();
  const activeBike = useMemo(
    () => bikes?.find((b) => b.id === activeBikeId) ?? bikes?.[0] ?? null,
    [bikes, activeBikeId],
  );

  const [value, setValue] = useState(() =>
    (activeBike?.currentMileage ?? 0).toString(),
  );

  const previous = activeBike?.currentMileage ?? 0;
  const delta = Math.max(0, parseInt(value || '0', 10) - previous);

  const handleKey = useCallback((k: string) => {
    setValue((curr) => {
      if (k === 'back') return curr.slice(0, -1) || '0';
      if (curr.length >= 7) return curr;
      return curr === '0' ? k : curr + k;
    });
  }, []);

  const handleSave = useCallback(() => {
    // TODO Batch 9 wiring: call mutation to update bike mileage + show toast
    router.back();
  }, []);

  const formatted = parseInt(value || '0', 10).toLocaleString('en-US');

  return (
    <SafeScreen showAppBar={false} scrollable={false}>
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-1">
            Quick log
          </Text>
          <Text className="text-[22px] font-sans-xbold text-ink tracking-tight">
            Odometer reading
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-muted/20 items-center justify-center active:scale-95"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="close" size={18} color={colors.ink} />
        </Pressable>
      </View>

      <View className="bg-muted/10 rounded-3xl p-6 mb-5">
        <Text className="text-[9px] font-sans-bold tracking-atelier uppercase text-ink/55 mb-2">
          New reading
        </Text>
        <View className="flex-row items-end">
          <Text
            className="text-display-sm font-sans-xbold text-ink"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatted}
          </Text>
          <Text className="text-lg font-sans-bold text-ink/55 ml-2 pb-3">KM</Text>
        </View>
        <Text className="text-[11px] font-sans-medium text-ink/55 mt-2">
          Previous: {previous.toLocaleString('en-US')} km ·{' '}
          <Text className="text-ink font-sans-bold">+{delta} km</Text>
        </Text>
      </View>

      <Keypad onKey={handleKey} />

      <Pressable
        onPress={handleSave}
        className="w-full bg-yellow rounded-full py-4 items-center mt-5 active:scale-[0.98]"
      >
        <Text className="text-[13px] font-sans-xbold tracking-wide text-ink">Save reading</Text>
      </Pressable>
    </SafeScreen>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

function Keypad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <View className="flex-row flex-wrap -mx-1">
      {KEYS.map((k, i) => (
        <View key={i} className="w-1/3 p-1">
          {k === '' ? (
            <View className="aspect-[1.6]" />
          ) : (
            <Pressable
              onPress={() => onKey(k)}
              className="aspect-[1.6] bg-surface rounded-2xl items-center justify-center active:bg-yellow/60"
            >
              {k === 'back' ? (
                <MaterialCommunityIcons name="backspace-outline" size={22} color={colors.ink} />
              ) : (
                <Text className="text-[28px] font-sans-bold text-ink" style={{ letterSpacing: -0.5 }}>
                  {k}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}
