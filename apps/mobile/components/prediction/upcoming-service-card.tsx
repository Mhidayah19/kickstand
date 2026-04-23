import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface UpcomingServiceCardProps {
  icon: string;
  label: string;
  value: string;
  unit: string;
  supporting?: string;
  variant?: 'dark' | 'light';
  onPress?: () => void;
}

export function UpcomingServiceCard({
  icon,
  label,
  value,
  unit,
  supporting,
  variant = 'light',
  onPress,
}: UpcomingServiceCardProps) {
  const isDark = variant === 'dark';
  const bg = isDark ? 'bg-ink' : 'bg-muted/10';
  const iconColor = isDark ? colors.yellow : colors.ink;
  const labelColor = isDark ? 'text-muted' : 'text-ink/55';
  const valueColor = isDark ? 'text-surface' : 'text-ink';
  const unitColor = isDark ? 'text-muted' : 'text-ink/55';
  const supportColor = isDark ? 'text-surface/60' : 'text-ink/55';

  return (
    <Pressable
      onPress={onPress}
      className={`${bg} rounded-[26px] p-5 active:opacity-80`}
      style={{ width: 190 }}
    >
      {isDark && (
        <View
          className="absolute bg-yellow/10 rounded-full"
          style={{ width: 80, height: 80, top: 0, right: 0 }}
        />
      )}
      <View className="relative">
        <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
        <Text
          className={`text-[9px] font-sans-bold tracking-atelier uppercase ${labelColor} mt-3 mb-1`}
        >
          {label}
        </Text>
        <View className="flex-row items-end">
          <Text
            className={`text-[22px] font-sans-xbold ${valueColor} leading-none`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {value}
          </Text>
          <Text className={`text-sm font-sans-bold ${unitColor} ml-1 pb-0.5`}>{unit}</Text>
        </View>
        {supporting && (
          <Text className={`text-[10px] font-sans-medium ${supportColor} mt-0.5`}>
            {supporting}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
