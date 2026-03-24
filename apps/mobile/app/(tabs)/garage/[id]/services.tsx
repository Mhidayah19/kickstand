import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { FilterChips } from '../../../../components/ui/filter-chips';
import { PillBadge } from '../../../../components/ui/pill-badge';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Section } from '../../../../components/ui/section';
import { TextField } from '../../../../components/ui/text-field';
import { useBike } from '../../../../lib/api/use-bikes';

const SERVICE_TYPES = ['Oil Change', 'Chain Adjustment', 'Brake Flush', 'Desmo Service'];

export default function ServiceLogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike } = useBike(id);

  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [mileage, setMileage] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <SafeScreen scrollable>
      {/* Header */}
      <View className="mb-2">
        <PillBadge label="Workshop v2.4" variant="yellow" />
      </View>
      <ScreenHeader
        title="New Service Log"
        subtitle={bike ? `${bike.model} • ${bike.plateNumber}` : 'Loading...'}
      />

      {/* Service Type Selector */}
      <View className="mb-8">
        <FilterChips
          options={SERVICE_TYPES}
          selected={serviceType}
          onSelect={setServiceType}
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
              placeholder="12 Mar 2026"
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
          <View className="flex-1">
            <TextField
              label="Service ID"
              value={serviceId}
              onChangeText={setServiceId}
              placeholder="SVC-0042"
            />
          </View>
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

      {/* Evidence & Documentation */}
      <Section label="Evidence & Documentation">
        <View className="flex-row items-center gap-3 mb-4">
          <PillBadge label="2 Files Attached" variant="surface" />
        </View>
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
          label="Save Log"
          onPress={() => {}}
          icon="check-circle"
        />
      </View>
    </SafeScreen>
  );
}
