import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { SparkLine } from './spark-line';

interface CategoryBarProps {
  icon: string;
  label: string;
  spent: string;
  projected?: string;
  spentRatio: number;
  projectedRatio?: number;
  sparkValues: number[];
  barColor?: 'charcoal' | 'yellow';
  onPress?: () => void;
}

export function CategoryBar({
  icon,
  label,
  spent,
  projected,
  spentRatio,
  projectedRatio = 0,
  sparkValues,
  barColor = 'charcoal',
  onPress,
}: CategoryBarProps) {
  const barBg = barColor === 'charcoal' ? 'bg-charcoal' : 'bg-yellow';
  const spentPct = Math.min(100, Math.max(0, spentRatio * 100));
  const projPct = Math.min(100 - spentPct, Math.max(0, projectedRatio * 100));

  return (
    <Pressable
      onPress={onPress}
      className="py-4 active:opacity-70"
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons name={icon as any} size={18} color={colors.charcoal} />
          <Text className="text-[13px] font-sans-bold text-charcoal">{label}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <SparkLine values={sparkValues} />
          <Text
            className="text-[13px] font-sans-bold text-charcoal"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {spent}
            {projected && (
              <Text className="text-[10px] font-sans-medium text-charcoal/55">
                {'  '}{projected}
              </Text>
            )}
          </Text>
          {onPress && (
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.outline} />
          )}
        </View>
      </View>
      <View className="h-1.5 rounded-full bg-surface-low overflow-hidden flex-row">
        <View className={`h-full ${barBg} rounded-full`} style={{ width: `${spentPct}%` }} />
        {projPct > 0 && (
          <View
            className="h-full border border-dashed border-sand rounded-r-full"
            style={{ width: `${projPct}%`, marginLeft: -1 }}
          />
        )}
      </View>
    </Pressable>
  );
}
