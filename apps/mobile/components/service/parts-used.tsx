import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { PARTS_PLACEHOLDERS } from '../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../lib/constants/service-types';

interface PartsUsedProps {
  serviceTypeKey: ServiceTypeKey;
  parts: { id: number; value: string }[];
  onUpdate: (id: number, value: string) => void;
  onAdd: () => void;
  onRemove: (id: number) => void;
}

export function PartsUsed({ serviceTypeKey, parts, onUpdate, onAdd, onRemove }: PartsUsedProps) {
  const placeholder = PARTS_PLACEHOLDERS[serviceTypeKey];

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-wide-1">
          Parts Used
        </Text>
        <Text className="text-xxs font-sans-bold text-sand uppercase tracking-wide-1">
          Optional
        </Text>
      </View>

      <View className="gap-3">
        {parts.map((part) => (
          <View key={part.id} className="bg-surface-low rounded-xl p-4 flex-row items-center gap-2">
            <TextInput
              value={part.value}
              onChangeText={(v) => onUpdate(part.id, v)}
              placeholder={placeholder}
              placeholderTextColor={colors.outline}
              className="flex-1 font-sans-medium text-sm text-charcoal p-0"
            />
            {parts.length > 1 && (
              <Pressable
                onPress={() => onRemove(part.id)}
                hitSlop={8}
                className="active:opacity-50"
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.outline} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={onAdd}
        className="mt-3 py-3 rounded-xl border-2 border-dashed border-sand/40 flex-row items-center justify-center gap-2 active:opacity-70"
      >
        <MaterialCommunityIcons name="plus" size={18} color={colors.sand} />
        <Text className="text-xs font-sans-bold text-sand uppercase tracking-wide-1">
          Add Item
        </Text>
      </Pressable>
    </View>
  );
}
