import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ScanReceiptCardProps {
  onPress: () => void;
  variant?: 'full' | 'compact';
}

export function ScanReceiptCard({ onPress, variant = 'full' }: ScanReceiptCardProps) {
  if (variant === 'compact') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Scan a receipt to auto-fill the form"
        className="self-start flex-row items-center gap-2 rounded-full bg-ink px-4 py-2.5 active:opacity-85"
      >
        <MaterialCommunityIcons name="line-scan" size={16} color={colors.yellow} />
        <Text className="text-[12px] font-sans-bold tracking-wide-1 uppercase text-surface">
          Scan receipt
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Scan a receipt to auto-fill the service log"
      testID="scan-receipt-card"
      className="rounded-3xl bg-ink p-lg active:opacity-90"
    >
      <View className="flex-row items-center gap-md">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-yellow/20">
          <MaterialCommunityIcons name="line-scan" size={26} color={colors.yellow} />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-yellow/85 mb-0.5">
            Faster
          </Text>
          <Text className="text-[17px] font-sans-bold text-surface leading-tight">
            Scan a receipt
          </Text>
          <Text className="text-[12px] font-sans-medium text-surface/60 mt-0.5 leading-snug">
            Auto-fill date, workshop, items and cost
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.5)" />
      </View>
    </Pressable>
  );
}
