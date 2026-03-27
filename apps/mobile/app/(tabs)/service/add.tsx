import React, { useState } from 'react';
import { Text, TextInput, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../lib/colors';
import { FilterChips } from '../../../components/ui/filter-chips';
import { PrimaryButton } from '../../../components/ui/primary-button';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { Section } from '../../../components/ui/section';
import { TextField } from '../../../components/ui/text-field';
import { useBike } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { useCreateServiceLog } from '../../../lib/api/use-service-logs';
import {
  SERVICE_TYPE_KEYS,
  SERVICE_TYPE_LABELS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../../lib/constants/service-types';

const SERVICE_CHIP_OPTIONS = SERVICE_TYPE_KEYS.map((key) => SERVICE_TYPE_LABELS[key]);

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AddServiceScreen() {
  const router = useRouter();
  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  const createLog = useCreateServiceLog(activeBikeId);

  const [serviceTypeLabel, setServiceTypeLabel] = useState(SERVICE_CHIP_OPTIONS[0]);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const selectedKey = SERVICE_TYPE_KEYS.find(
    (k) => SERVICE_TYPE_LABELS[k] === serviceTypeLabel,
  ) as ServiceTypeKey;

  const handleSave = async () => {
    if (!activeBikeId) {
      Alert.alert('No bike selected', 'Please select a bike in your garage first.');
      return;
    }
    const mileageNum = parseInt(mileage, 10);
    if (!selectedKey || isNaN(mileageNum) || !date || !notes.trim() || !cost.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields (type, mileage, date, cost, notes).');
      return;
    }

    try {
      await createLog.mutateAsync({
        serviceType: selectedKey,
        mileageAt: mileageNum,
        date,
        cost: cost.trim(),
        description: notes.trim(),
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save service log.');
    }
  };

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title="New Service Log"
        subtitle={bike ? `${bike.make} ${bike.model} • ${bike.plateNumber}` : 'Loading...'}
      />

      {/* Service Type Selector */}
      <View className="mb-8">
        <FilterChips
          options={SERVICE_CHIP_OPTIONS}
          selected={serviceTypeLabel}
          onSelect={setServiceTypeLabel}
          wrap
        />
      </View>

      {/* Bento Form Grid */}
      <View className="mb-6">
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <TextField
              label="Mileage"
              value={mileage}
              onChangeText={setMileage}
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
              value={date}
              onChangeText={setDate}
              placeholder="2026-03-27"
            />
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <TextField
              label="Estimated Cost"
              value={cost}
              onChangeText={setCost}
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
          value={notes}
          onChangeText={setNotes}
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
          label={createLog.isPending ? 'Saving...' : 'Save Log'}
          onPress={handleSave}
          icon="check-circle"
          disabled={createLog.isPending}
        />
      </View>
    </SafeScreen>
  );
}
