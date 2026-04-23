import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { FadeIn } from './fade-in';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SummaryPillProps {
  icon: IconName;
  label: string;
  onEdit: () => void;
  children?: React.ReactNode;
}

export function SummaryPill({ icon, label, onEdit, children }: SummaryPillProps) {
  return (
    <FadeIn>
      <TouchableOpacity
        className="bg-bg-2 rounded-xl px-lg py-md flex-row items-center justify-between"
        onPress={onEdit}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${label}`}
      >
        <View className="flex-row items-center gap-md flex-1">
          <MaterialCommunityIcons name={icon} size={20} color={colors.ink} />
          {children ?? (
            <Text className="font-sans-bold text-ink text-sm">{label}</Text>
          )}
        </View>
        <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.muted} />
      </TouchableOpacity>
    </FadeIn>
  );
}
