import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PillBadge } from './pill-badge';

interface StatusCardProps {
  icon: string;
  iconColor: string;
  title: string;
  status: string;
  statusVariant: 'yellow' | 'danger' | 'surface';
  bgClass?: string;
}

export function StatusCard({
  icon,
  iconColor,
  title,
  status,
  statusVariant,
  bgClass = 'bg-surface-low',
}: StatusCardProps) {
  return (
    <View className={`${bgClass} rounded-3xl p-6 flex-1 aspect-square justify-between`}>
      <View>
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color={iconColor}
          style={{ marginBottom: 16 }}
        />
        <Text className="font-sans-bold text-lg text-charcoal leading-tight">{title}</Text>
      </View>
      <PillBadge label={status} variant={statusVariant} />
    </View>
  );
}
