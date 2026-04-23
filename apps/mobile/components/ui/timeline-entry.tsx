import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface TimelineEntryProps {
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  cost: string;
  parts?: string[];
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TimelineEntry({
  icon = 'wrench',
  iconBg = 'bg-muted/20',
  iconColor = colors.ink,
  title,
  subtitle,
  cost,
  parts,
  onPress,
  onLongPress,
}: TimelineEntryProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="px-5 py-4 active:bg-bg-2"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 mr-3">
          <View className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center`}>
            <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-base text-ink leading-tight">{title}</Text>
            {subtitle && (
              <Text className="font-sans-medium text-xs text-muted mt-0.5">{subtitle}</Text>
            )}
          </View>
        </View>
        <Text
          className="font-sans-xbold text-base text-ink"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {cost}
        </Text>
      </View>
      {parts && parts.length > 0 && (
        <View className="flex-row flex-wrap gap-1.5 mt-2 ml-[52px]">
          {parts.map((part, i) => (
            <View key={`${i}-${part}`} className="px-2.5 py-0.5 rounded-full bg-bg-2">
              <Text className="font-sans-bold text-xxs text-ink">{part}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
