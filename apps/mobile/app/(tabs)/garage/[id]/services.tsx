import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import React from 'react';
import { Text, TextInput, View, Alert } from 'react-native';
import { FilterChips } from '../../../../components/ui/filter-chips';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Section } from '../../../../components/ui/section';
import { TextField } from '../../../../components/ui/text-field';
import { useBike } from '../../../../lib/api/use-bikes';
import {
  SERVICE_CHIP_OPTIONS,
  useServiceLogForm,
} from '../../../../lib/hooks/use-service-log-form';

export default function ServiceLogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike } = useBike(id);
  const form = useServiceLogForm(id ?? null);

  const handleSave = async () => {
    try {
      await form.handleSave();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save service log.';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title="New Service Log"
        subtitle={bike ? `${bike.make ?? ''} ${bike.model ?? ''}`.trim() + (bike.plateNumber ? ` • ${bike.plateNumber}` : '') : 'Loading...'}
      />

      {/* Service Type Selector */}
      <View className="mb-8">
        <FilterChips
          options={SERVICE_CHIP_OPTIONS}
          selected={form.serviceTypeLabel}
          onSelect={form.setServiceTypeLabel}
          wrap
        />
      </View>

      {/* Bento Form Grid */}
      <View className="mb-6">
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <TextField
              label="Mileage"
              value={form.mileage}
              onChangeText={form.setMileage}
              placeholder="24,500"
              keyboardType="numeric"
            />
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mt-1 self-end pr-2">
              KM
            </Text>
          </View>
          <View className="flex-1">
            <TextField
              label="Date"
              value={form.date}
              onChangeText={form.setDate}
              placeholder="2026-03-27"
            />
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <TextField
              label="Estimated Cost"
              value={form.cost}
              onChangeText={form.setCost}
              placeholder="350"
              prefix="$"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1" />
        </View>
      </View>

      {/* Notes */}
      <View className="mb-8">
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-2">
          Notes
        </Text>
        <TextInput
          value={form.notes}
          onChangeText={form.setNotes}
          placeholder="Add any notes about this service..."
          placeholderTextColor={colors.outline}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-surface-low rounded-xl p-5 text-base font-sans-medium text-charcoal"
          style={{ minHeight: 120 }}
        />
      </View>

      {/* Evidence & Documentation (UI placeholder only) */}
      <Section label="Evidence & Documentation">
        <View
          className="border-2 border-dashed border-outline rounded-xl py-8 items-center justify-center"
        >
          <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
          <Text className="font-sans-bold text-sm text-outline mt-2">
            Upload Evidence
          </Text>
        </View>
      </Section>

      {/* Save Button */}
      <View className="mt-4">
        <PrimaryButton
          label={form.isPending ? 'Saving...' : 'Save Log'}
          onPress={handleSave}
          icon="check-circle"
          disabled={form.isPending}
        />
      </View>
    </SafeScreen>
  );
}
