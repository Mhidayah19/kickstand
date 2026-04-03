import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../ui/bottom-sheet';
import { DateField } from '../ui/date-field';
import { PrimaryButton } from '../ui/primary-button';

interface DateRangeSheetProps {
  visible: boolean;
  onClose: () => void;
  value: { from: string; to: string } | null;
  onApply: (range: { from: string; to: string } | null) => void;
}

type PresetKey = 'last30' | 'last3months' | 'thisYear' | 'allTime' | 'custom';

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'last30', label: 'Last 30 days' },
  { key: 'last3months', label: 'Last 3 months' },
  { key: 'thisYear', label: 'This year' },
  { key: 'allTime', label: 'All time' },
  { key: 'custom', label: 'Custom range' },
];

function toISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getPresetRange(key: PresetKey): { from: string; to: string } | null {
  if (key === 'allTime' || key === 'custom') return null;
  const today = new Date();
  const to = toISO(today);
  switch (key) {
    case 'last30': {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from: toISO(from), to };
    }
    case 'last3months': {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 3);
      return { from: toISO(from), to };
    }
    case 'thisYear':
      return { from: `${today.getFullYear()}-01-01`, to };
  }
}

export function DateRangeSheet({ visible, onClose, value, onApply }: DateRangeSheetProps) {
  const today = toISO(new Date());
  const [activePreset, setActivePreset] = useState<PresetKey>(value ? 'custom' : 'allTime');
  const [customFrom, setCustomFrom] = useState(value?.from ?? today);
  const [customTo, setCustomTo] = useState(value?.to ?? today);

  const handlePreset = useCallback((key: PresetKey) => {
    setActivePreset(key);
  }, []);

  const handleApply = useCallback(() => {
    if (activePreset === 'custom') {
      onApply({ from: customFrom, to: customTo });
    } else {
      onApply(getPresetRange(activePreset));
    }
  }, [activePreset, customFrom, customTo, onApply]);

  const isCustom = activePreset === 'custom';
  const applyDisabled = isCustom && customFrom > customTo;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text className="font-sans-xbold text-lg text-charcoal mb-1">Filter by Date</Text>
      <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-2 mb-5">
        Select a preset or custom range
      </Text>

      {/* Preset chips */}
      <View className="flex-row flex-wrap gap-2 mb-5">
        {PRESETS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => handlePreset(key)}
            className={`px-4 py-2 rounded-full ${
              activePreset === key ? 'bg-charcoal' : 'bg-surface-low'
            }`}
          >
            <Text
              className={`font-sans-bold text-sm ${
                activePreset === key ? 'text-white' : 'text-sand'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom date pickers */}
      {isCustom && (
        <View className="flex-row gap-3 mb-5">
          <DateField
            label="From"
            value={customFrom}
            onChange={setCustomFrom}
            className="flex-1"
          />
          <DateField
            label="To"
            value={customTo}
            onChange={setCustomTo}
            className="flex-1"
          />
        </View>
      )}

      <PrimaryButton
        label="Apply Filter"
        onPress={handleApply}
        disabled={applyDisabled}
      />
    </BottomSheet>
  );
}
