import React, { useState } from 'react';
import { Text, TextInput, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { FilterChips } from '../ui/filter-chips';
import { PrimaryButton } from '../ui/primary-button';
import { ScreenHeader } from '../ui/screen-header';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { SERVICE_CHIP_OPTIONS } from '../../lib/constants/service-types';
import type { useServiceLogForm } from '../../lib/hooks/use-service-log-form';

interface ServiceLogFormBodyProps {
  form: ReturnType<typeof useServiceLogForm>;
  bikeLabel: string;
  onSave: () => Promise<void>;
  onExit?: () => void;
}

export function ServiceLogFormBody({ form, bikeLabel, onSave, onExit }: ServiceLogFormBodyProps) {
  const [notesFocused, setNotesFocused] = useState(false);

  return (
    <View>
      <ScreenHeader
        title="New Service Log"
        subtitle={bikeLabel}
        rightAction={
          <Pressable
            onPress={onExit}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-sand/20 items-center justify-center active:opacity-70"
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.charcoal} />
          </Pressable>
        }
      />

      {/* Service Type Selector */}
      <View className="mb-10">
        <FilterChips
          options={SERVICE_CHIP_OPTIONS}
          selected={form.serviceTypeLabel}
          onSelect={form.setServiceTypeLabel}
        />
      </View>

      {/* Bento Form Grid */}
      <View className="mb-6">
        {/* Mileage + Date row */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <TextField
              label="Mileage"
              value={form.mileage}
              onChangeText={form.setMileage}
              placeholder="54,000"
              keyboardType="numeric"
              inputClassName="text-xl"
              suffix="km"
            />
          </View>
          <View className="flex-1">
            <TextField
              label="Date"
              value={form.date}
              onChangeText={form.setDate}
              placeholder="29 Mar 2026"
              inputClassName="text-xl"
            />
          </View>
        </View>

        {/* Cost — full width */}
        <TextField
          label="Estimated Cost"
          value={form.cost}
          onChangeText={form.setCost}
          placeholder="350"
          prefix="$"
          keyboardType="numeric"
          inputClassName="text-xl"
        />
      </View>

      {/* Notes */}
      <View className="mb-8">
        <Text className="font-sans-bold text-xs text-sand uppercase tracking-wide-1 mb-2">
          Notes
        </Text>
        <View
          className="bg-surface-low rounded-xl overflow-hidden"
          style={notesFocused ? { borderBottomWidth: 2, borderBottomColor: colors.yellow } : undefined}
        >
          <TextInput
            value={form.notes}
            onChangeText={form.setNotes}
            onFocus={() => setNotesFocused(true)}
            onBlur={() => setNotesFocused(false)}
            placeholder="Add any notes about this service..."
            placeholderTextColor={colors.outline}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="p-5 text-base font-sans-medium text-charcoal"
            style={{ minHeight: 120 }}
          />
        </View>
      </View>

      {/* Evidence & Documentation (UI placeholder only) */}
      <Section label="Evidence & Documentation">
        <View className="border-2 border-dashed border-outline rounded-xl py-8 items-center justify-center">
          <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
          <Text className="font-sans-bold text-sm text-outline mt-2">Upload Evidence</Text>
        </View>
      </Section>

      {/* Save Button */}
      <View className="mt-4">
        <PrimaryButton
          label={form.isPending ? 'Saving...' : 'Save Log'}
          onPress={onSave}
          icon="check-circle"
          disabled={form.isPending}
        />
      </View>
    </View>
  );
}
