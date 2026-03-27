import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import React, { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { DateField } from '../../../../components/ui/date-field';
import { FilterChips } from '../../../../components/ui/filter-chips';
import { PillBadge } from '../../../../components/ui/pill-badge';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Section } from '../../../../components/ui/section';
import { TextField } from '../../../../components/ui/text-field';
import { useBike } from '../../../../lib/api/use-bikes';
import { useCreateServiceLog } from '../../../../lib/api/use-service-logs';

const SERVICE_TYPE_OPTIONS = [
  { key: 'oil_change',        label: 'Oil Change' },
  { key: 'chain_adjustment',  label: 'Chain Adjustment' },
  { key: 'chain_replacement', label: 'Chain Replacement' },
  { key: 'brake_pads',        label: 'Brake Pads' },
  { key: 'brake_fluid',       label: 'Brake Fluid' },
  { key: 'coolant',           label: 'Coolant' },
  { key: 'air_filter',        label: 'Air Filter' },
  { key: 'spark_plugs',       label: 'Spark Plugs' },
  { key: 'tire_front',        label: 'Front Tyre' },
  { key: 'tire_rear',         label: 'Rear Tyre' },
  { key: 'valve_clearance',   label: 'Valve Clearance' },
  { key: 'battery',           label: 'Battery' },
  { key: 'general_service',   label: 'General Service' },
  { key: 'fork_oil',          label: 'Fork Oil' },
  { key: 'clutch',            label: 'Clutch' },
] as const;

function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ServiceLogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike } = useBike(id);
  const createServiceLog = useCreateServiceLog(id ?? '');

  const [serviceType, setServiceType] = useState('Oil Change');
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState(todayISO());
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');

  const [mileageError, setMileageError] = useState('');
  const [costError, setCostError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  function validate(): boolean {
    let valid = true;
    if (!description.trim()) {
      setDescriptionError('Description is required');
      valid = false;
    } else {
      setDescriptionError('');
    }
    const mileageNum = parseInt(mileage, 10);
    if (!mileage.trim() || isNaN(mileageNum) || mileageNum < 0) {
      setMileageError('Enter a valid mileage');
      valid = false;
    } else {
      setMileageError('');
    }
    const costNum = parseFloat(cost);
    if (!cost.trim() || isNaN(costNum) || costNum < 0) {
      setCostError('Enter a valid cost');
      valid = false;
    } else {
      setCostError('');
    }
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    const serviceTypeKey = SERVICE_TYPE_OPTIONS.find(o => o.label === serviceType)!.key;
    try {
      await createServiceLog.mutateAsync({
        serviceType: serviceTypeKey,
        description,
        cost,
        mileageAt: parseInt(mileage, 10),
        date,
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save log';
      Alert.alert('Error', message);
    }
  }

  return (
    <SafeScreen scrollable>
      <View className="mb-2">
        <PillBadge label="New Entry" variant="yellow" />
      </View>
      <ScreenHeader
        title="New Service Log"
        subtitle={bike ? `${bike.model} • ${bike.plateNumber}` : 'Loading...'}
      />

      <View className="mb-8">
        <FilterChips
          options={SERVICE_TYPE_OPTIONS.map(o => o.label)}
          selected={serviceType}
          onSelect={setServiceType}
          wrap
        />
      </View>

      <View className="mb-6">
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <TextField
              label="Mileage"
              value={mileage}
              onChangeText={setMileage}
              placeholder="24500"
              keyboardType="numeric"
              error={mileageError}
            />
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mt-1 self-end pr-2">
              KM
            </Text>
          </View>
          <View className="flex-1">
            <DateField
              label="Date"
              value={date}
              onChange={setDate}
            />
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <TextField
              label="Cost"
              value={cost}
              onChangeText={setCost}
              placeholder="350"
              prefix="$"
              keyboardType="numeric"
              error={costError}
            />
          </View>
        </View>
      </View>

      <View className="mb-8">
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-wide-1 mb-2">
          Notes
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add any notes about this service..."
          placeholderTextColor={colors.outline}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="bg-surface-low rounded-xl p-5 text-base font-sans-medium text-charcoal"
          style={{ minHeight: 120 }}
        />
        {descriptionError ? (
          <Text className="text-xs text-danger font-sans-medium mt-1">{descriptionError}</Text>
        ) : null}
      </View>

      <Section label="Evidence & Documentation">
        <View className="flex-row items-center gap-3 mb-4">
          <PillBadge label="Upload Coming Soon" variant="surface" />
        </View>
        <View className="border-2 border-dashed border-outline rounded-xl py-8 items-center justify-center">
          <MaterialCommunityIcons name="camera-outline" size={28} color={colors.outline} />
          <Text className="font-sans-bold text-sm text-outline mt-2">
            Upload Evidence
          </Text>
        </View>
      </Section>

      <View className="mt-4">
        <PrimaryButton
          label={createServiceLog.isPending ? 'Saving...' : 'Save Log'}
          onPress={handleSubmit}
          icon="check-circle"
          disabled={createServiceLog.isPending}
        />
      </View>
    </SafeScreen>
  );
}
