import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeScreen } from '../components/ui/safe-screen';
import { useCreateWorkshop } from '../lib/api/use-create-workshop';
import { useWorkshopPickerStore } from '../lib/store/workshop-picker-store';
import { colors } from '../lib/colors';

export default function WorkshopManualScreen() {
  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [name, setName] = useState(prefill ?? '');
  const [address, setAddress] = useState('');
  const create = useCreateWorkshop();
  const setSelection = useWorkshopPickerStore((s) => s.setSelection);

  const canSave = name.trim().length > 0 && !create.isPending;

  const handleSave = useCallback(async () => {
    try {
      const workshop = await create.mutateAsync({
        name: name.trim(),
        address: address.trim() || undefined,
      });
      setSelection({
        id: workshop.id,
        name: workshop.name,
        address: workshop.address ?? null,
      });
      router.dismiss(2);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to add workshop.';
      Alert.alert('Error', message);
    }
  }, [name, address, create, setSelection]);

  return (
    <SafeScreen showAppBar={false} scrollable={false}>
      <View className="flex-row items-center justify-between mb-6">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text className="text-[13px] font-sans-bold text-charcoal">
            Cancel
          </Text>
        </Pressable>
        <Text className="text-[13px] font-sans-bold text-charcoal">
          Add workshop
        </Text>
        <View className="w-10" />
      </View>

      <View className="mb-lg">
        <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2">
          Workshop name *
        </Text>
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          placeholder="e.g. Ah Seng Motor"
          placeholderTextColor={`${colors.charcoal}88`}
          className="bg-surface-low rounded-2xl px-4 py-4 text-[15px] font-sans-medium text-charcoal"
        />
      </View>

      <View className="mb-lg">
        <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2">
          Address (optional)
        </Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Blk 12 Geylang Lor 13"
          placeholderTextColor={`${colors.charcoal}88`}
          className="bg-surface-low rounded-2xl px-4 py-4 text-[15px] font-sans-medium text-charcoal"
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        className={`rounded-full py-4 items-center mt-4 ${canSave ? 'bg-yellow active:scale-[0.98]' : 'bg-sand/30'}`}
      >
        <Text className="text-[13px] font-sans-xbold tracking-wide text-charcoal">
          {create.isPending ? 'Saving…' : 'Save workshop'}
        </Text>
      </Pressable>
    </SafeScreen>
  );
}
