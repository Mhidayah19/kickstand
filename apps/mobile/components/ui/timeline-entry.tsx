import { View, Text, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import type { TimelineColor } from '../../lib/service-type-meta';

interface TimelineEntryProps {
  title: string;
  cost: string;
  color: TimelineColor;
  tags?: { label: string; danger?: boolean }[];
  quote?: string;
  imageUri?: string;
  parts?: string[];
  mileage?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

const nodeColors: Record<TimelineColor, string> = {
  yellow: colors.yellow,
  charcoal: colors.charcoal,
  danger: colors.danger,
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function TimelineEntry({
  title,
  cost,
  color,
  tags,
  quote,
  imageUri,
  parts,
  mileage,
  onPress,
  onLongPress,
}: TimelineEntryProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View className="relative pl-12 mb-4">
        {/* Card */}
        <View className="bg-surface-card p-6 rounded-2xl">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-2 mb-1">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: nodeColors[color] }}
                />
                <Text className="font-sans-xbold text-xl text-charcoal">{title}</Text>
              </View>
              {mileage && (
                <Text className="font-sans-medium text-xs text-charcoal/60 mt-0.5">
                  {mileage}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="font-sans-xbold text-xl text-charcoal">{cost}</Text>
            </View>
          </View>

          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <View
                  key={tag.label}
                  className={`px-3 py-1 rounded-full ${
                    tag.danger ? 'bg-danger-surface' : 'bg-charcoal'
                  }`}
                >
                  <Text
                    className={`font-sans-bold text-xxs uppercase tracking-widest ${
                      tag.danger ? 'text-danger' : 'text-white'
                    }`}
                  >
                    {tag.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {parts && parts.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {parts.map((part, index) => (
                <View key={`${index}-${part}`} className="flex-row items-center gap-1 px-3 py-1 rounded-full bg-surface-low">
                  <Text className="font-sans-bold text-xxs text-charcoal">
                    {truncate(part, 24)}
                  </Text>
                  <MaterialCommunityIcons name="wrench" size={10} color={colors.sand} />
                </View>
              ))}
            </View>
          )}

          {quote && (
            <View className="bg-sand/10 rounded-xl p-3">
              <Text className="text-sm text-charcoal italic font-sans-medium">{quote}</Text>
            </View>
          )}

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-32 rounded-xl mt-2"
              resizeMode="cover"
            />
          )}

          {onPress && (
            <View className="absolute right-4 top-0 bottom-0 justify-center">
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.sand} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
