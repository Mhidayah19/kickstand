import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ListCardProps {
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  trailing?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export function ListCard({
  icon,
  iconBg = 'bg-surface-low',
  iconColor = colors.charcoal,
  title,
  subtitle,
  trailing,
  onPress,
  children,
}: ListCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="bg-surface-card rounded-2xl px-5 py-4 flex-row items-center justify-between active:bg-surface-low"
    >
      <View className="flex-row items-center gap-4 flex-1">
        {icon && (
          <View className={`w-12 h-12 rounded-xl ${iconBg} items-center justify-center`}>
            <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
          </View>
        )}
        <View className="flex-1">
          <Text className="font-sans-bold text-sm text-charcoal">{title}</Text>
          {subtitle && (
            <Text className="font-sans-medium text-xs text-outline mt-0.5">{subtitle}</Text>
          )}
          {children}
        </View>
      </View>
      {trailing ? (
        <Text
          className="font-sans-bold text-sm text-charcoal ml-3"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {trailing}
        </Text>
      ) : onPress ? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outline} />
      ) : null}
    </Pressable>
  );
}
