import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface WorkshopFieldProps {
  workshopName: string | null;
  workshopAddress: string | null;
  onPress: () => void;
  onClear: () => void;
}

export function WorkshopField({
  workshopName,
  workshopAddress,
  onPress,
  onClear,
}: WorkshopFieldProps) {
  const isEmpty = !workshopName;

  return (
    <View className="mb-lg">
      <Text className="text-[10px] font-sans-bold tracking-atelier uppercase text-charcoal/55 mb-2">
        Workshop
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          isEmpty ? 'Add workshop' : `Change workshop: ${workshopName}`
        }
        className="bg-surface-low rounded-2xl px-4 py-4 flex-row items-center active:opacity-90"
      >
        <View className="flex-1 pr-3">
          {isEmpty ? (
            <Text className="text-[15px] font-sans-medium text-charcoal/55">
              Add workshop
            </Text>
          ) : (
            <>
              <Text
                className="text-[15px] font-sans-bold text-charcoal"
                numberOfLines={1}
              >
                {workshopName}
              </Text>
              {!!workshopAddress && (
                <Text
                  className="text-[12px] font-sans-medium text-charcoal/55 mt-0.5"
                  numberOfLines={1}
                >
                  {workshopAddress}
                </Text>
              )}
            </>
          )}
        </View>

        {!isEmpty && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear workshop"
            className="w-7 h-7 rounded-full items-center justify-center active:opacity-70 mr-1"
          >
            <MaterialCommunityIcons
              name="close"
              size={14}
              color={colors.charcoal}
            />
          </Pressable>
        )}
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={colors.charcoal}
        />
      </Pressable>
    </View>
  );
}
