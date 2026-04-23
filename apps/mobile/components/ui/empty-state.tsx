import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Pressable
      onPress={onAction}
      disabled={!onAction}
      className="h-40 border-2 border-dashed border-hairline-2/40 rounded-3xl items-center justify-center gap-2 active:border-yellow"
    >
      <View className="w-12 h-12 rounded-full bg-muted/10 items-center justify-center">
        <MaterialCommunityIcons name="plus" size={24} color={colors.muted} />
      </View>
      <Text className="font-sans-bold text-sm text-muted tracking-wide-1">
        {actionLabel || title}
      </Text>
      {description && (
        <Text className="font-sans-medium text-xs text-muted/70 text-center px-6">
          {description}
        </Text>
      )}
    </Pressable>
  );
}
