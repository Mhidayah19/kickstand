import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface BikeImageCardProps {
  make: string;
  model: string;
  status: 'ready' | 'overdue';
  mileage?: { value: number; unit: string };
  onPress: () => void;
  onMenuPress?: () => void;
}

export function BikeImageCard({
  make,
  model,
  status,
  mileage,
  onPress,
  onMenuPress,
}: BikeImageCardProps) {
  const isOverdue = status === 'overdue';
  const iconVariant = isOverdue
    ? { bg: 'bg-charcoal', color: colors.danger, accent: colors.danger }
    : { bg: 'bg-yellow', color: colors.charcoal, accent: colors.yellow };

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-2xl px-5 py-4 flex-row items-center gap-4 overflow-hidden"
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 3,
          backgroundColor: iconVariant.accent,
        }}
      />

      <View className={`w-12 h-12 rounded-xl items-center justify-center ${iconVariant.bg}`}>
        <MaterialCommunityIcons name="motorbike" size={20} color={iconVariant.color} />
      </View>

      <View className="flex-1">
        <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">
          {make}
        </Text>
        <Text className="font-sans-bold text-base text-charcoal">{model}</Text>
        <Text className="font-sans-medium text-sm text-sand">
          {mileage && `${mileage.value.toLocaleString()} ${mileage.unit} · `}
          {isOverdue ? 'Service Overdue' : 'Ready to Ride'}
        </Text>
      </View>

      {onMenuPress && (
        <Pressable onPress={onMenuPress} hitSlop={8} className="active:opacity-70">
          <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.outline} />
        </Pressable>
      )}
    </Pressable>
  );
}
