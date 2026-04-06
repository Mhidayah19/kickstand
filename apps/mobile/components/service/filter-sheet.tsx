import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheet } from '../ui/bottom-sheet';
import { DateField } from '../ui/date-field';
import { PrimaryButton } from '../ui/primary-button';
import { FILTER_OPTIONS } from '../../lib/constants/service-types';
import type { FilterGroupKey } from '../../lib/constants/service-types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedFilter: FilterGroupKey;
  dateRange: { from: string; to: string } | null;
  onApply: (filter: FilterGroupKey, dateRange: { from: string; to: string } | null) => void;
}

type PresetKey = 'last30' | 'last3months' | 'thisYear' | 'allTime' | 'custom';

const DATE_PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'allTime', label: 'All time' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'last3months', label: 'Last 3 months' },
  { key: 'thisYear', label: 'This year' },
  { key: 'custom', label: 'Custom' },
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
    default:
      return null;
  }
}

export function FilterSheet({
  visible,
  onClose,
  selectedFilter,
  dateRange,
  onApply,
}: FilterSheetProps) {
  const today = useMemo(() => toISO(new Date()), []);
  const [activeCategory, setActiveCategory] = useState<FilterGroupKey>(selectedFilter);
  const [activePreset, setActivePreset] = useState<PresetKey>(dateRange ? 'custom' : 'allTime');
  const [customFrom, setCustomFrom] = useState(dateRange?.from ?? today);
  const [customTo, setCustomTo] = useState(dateRange?.to ?? today);

  // Re-sync local state when sheet opens (BottomSheet keeps children mounted)
  useEffect(() => {
    if (visible) {
      setActiveCategory(selectedFilter);
      setActivePreset(dateRange ? 'custom' : 'allTime');
      setCustomFrom(dateRange?.from ?? today);
      setCustomTo(dateRange?.to ?? today);
    }
  }, [visible, selectedFilter, dateRange, today]);

  const handleApply = useCallback(() => {
    const range =
      activePreset === 'custom'
        ? { from: customFrom, to: customTo }
        : getPresetRange(activePreset);
    onApply(activeCategory, range);
  }, [activeCategory, activePreset, customFrom, customTo, onApply]);

  const isCustom = activePreset === 'custom';
  const applyDisabled = isCustom && customFrom > customTo;

  const hasActiveFilters = activeCategory !== 'All' || activePreset !== 'allTime';

  const handleReset = useCallback(() => {
    setActiveCategory('All');
    setActivePreset('allTime');
    setCustomFrom(today);
    setCustomTo(today);
  }, [today]);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="flex-row items-start justify-between mb-1">
        <Text className="font-sans-xbold text-lg text-charcoal">Filters</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7} hitSlop={8}>
            <Text className="font-sans-bold text-sm text-charcoal">Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-wide-2 mb-6">
        Category and date range
      </Text>

      <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-wide-1 mb-3">
        Category
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => setActiveCategory(option)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === option ? 'bg-charcoal' : 'bg-surface-low'
            }`}
          >
            <Text
              className={`font-sans-bold text-sm ${
                activeCategory === option ? 'text-white' : 'text-charcoal'
              }`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-wide-1 mb-3">
        Date Range
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {DATE_PRESETS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActivePreset(key)}
            className={`px-4 py-2 rounded-full ${
              activePreset === key ? 'bg-charcoal' : 'bg-surface-low'
            }`}
          >
            <Text
              className={`font-sans-bold text-sm ${
                activePreset === key ? 'text-white' : 'text-charcoal'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isCustom && (
        <View className="flex-row gap-3 mb-5">
          <DateField
            label="From"
            value={customFrom}
            onChange={setCustomFrom}
            className="flex-1"
          />
          <DateField label="To" value={customTo} onChange={setCustomTo} className="flex-1" />
        </View>
      )}

      <PrimaryButton label="Apply Filters" variant="accent" onPress={handleApply} disabled={applyDisabled} />
    </BottomSheet>
  );
}
