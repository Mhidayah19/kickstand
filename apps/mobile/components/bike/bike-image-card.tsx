import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import { formatDaysAgo } from '../../lib/format';

export interface BikeStatPill {
  label: string;
  value: string;
  unit: string;
  danger?: boolean;
}

interface LastService {
  label: string;
  workshop?: string;
  daysAgo: number;
}

interface BikeImageCardProps {
  make: string;
  model: string;
  status: 'ready' | 'overdue';
  mileage?: { value: number; unit: string };
  stats?: BikeStatPill[];
  lastService?: LastService;
  onPress: () => void;
  onMenuPress?: () => void;
}

export function BikeImageCard({
  make,
  model,
  status,
  mileage,
  stats,
  lastService,
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
      className="bg-surface-card rounded-2xl overflow-hidden"
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

      {/* Header: icon + make/model */}
      <View className="px-5 pt-5 pb-4">
        <View className="flex-row items-center gap-3 mb-4">
          <View className={`w-10 h-10 rounded-xl items-center justify-center ${iconVariant.bg}`}>
            <MaterialCommunityIcons name="motorbike" size={18} color={iconVariant.color} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-0.5">
              {make}
            </Text>
            <Text className="font-sans-xbold text-lg text-charcoal leading-tight">{model}</Text>
          </View>
        </View>

        {/* Stat pills */}
        {stats && stats.length > 0 ? (
          <View className="flex-row gap-2">
            {stats.map((stat) => (
              <View key={stat.label} className="flex-1 bg-surface-low rounded-xl px-3 py-2.5">
                <Text
                  className={`font-sans-bold text-xxs uppercase tracking-widest mb-0.5 ${
                    stat.danger ? 'text-danger' : 'text-sand'
                  }`}
                >
                  {stat.label}
                </Text>
                <Text
                  className={`font-sans-xbold text-sm ${stat.danger ? 'text-danger' : 'text-charcoal'}`}
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {stat.value}{' '}
                  <Text
                    className={`font-sans-bold text-xxs ${stat.danger ? 'text-danger/60' : 'text-sand'}`}
                  >
                    {stat.unit}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        ) : (
          /* Fallback: simple mileage + status line (backwards compat) */
          <Text className="font-sans-medium text-sm text-sand">
            {mileage && `${mileage.value.toLocaleString()} ${mileage.unit} · `}
            {isOverdue ? 'Service Overdue' : 'Ready to Ride'}
          </Text>
        )}
      </View>

      {/* Last service footer */}
      {lastService && (
        <View className="flex-row items-center justify-between px-5 py-3 border-t border-surface-low">
          <Text className="font-sans-medium text-sm text-sand" numberOfLines={1}>
            {lastService.label}
            {lastService.workshop ? ` · ${lastService.workshop}` : ''}
            {' · '}
            {formatDaysAgo(lastService.daysAgo)}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={colors.outline} />
        </View>
      )}
    </Pressable>
  );
}
