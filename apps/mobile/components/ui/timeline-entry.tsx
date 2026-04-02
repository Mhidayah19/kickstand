import { View, Text, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';
import type { TimelineColor } from '../../lib/service-type-meta';

interface TimelineEntryProps {
  date: string;
  title: string;
  cost: string;
  icon: string;
  color: TimelineColor;
  tags?: { label: string; danger?: boolean }[];
  quote?: string;
  imageUri?: string;
  parts?: string[];
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
  date,
  title,
  cost,
  icon,
  color,
  tags,
  quote,
  imageUri,
  parts,
  onPress,
  onLongPress,
}: TimelineEntryProps) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <View className="relative pl-12 mb-12">
        {/* Node */}
        <View
          className="absolute left-0 top-1 w-8 h-8 rounded-full items-center justify-center z-10"
          style={{ backgroundColor: nodeColors[color] }}
        >
          <MaterialCommunityIcons name={icon as any} size={14} color={colors.white} />
        </View>

        {/* Card */}
        <View className="bg-surface-card p-6 rounded-2xl">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="font-sans-bold text-xxs text-charcoal uppercase tracking-widest mb-1">
                {date}
              </Text>
              <Text className="font-sans-xbold text-xl text-charcoal">{title}</Text>
            </View>
            <Text className="font-sans-bold text-lg text-charcoal">{cost}</Text>
          </View>

          {tags && tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <View
                  key={tag.label}
                  className={`px-3 py-1 rounded-full ${
                    tag.danger ? 'bg-danger-surface' : 'bg-surface-low'
                  }`}
                >
                  <Text
                    className={`font-sans-bold text-xxs uppercase tracking-widest ${
                      tag.danger ? 'text-danger' : 'text-charcoal'
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
              {parts.map((part) => (
                <View key={part} className="px-3 py-1 rounded-full bg-surface-low">
                  <Text className="font-sans-bold text-xxs text-sand">
                    {truncate(part, 24)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {quote && (
            <View className="bg-sand/10 rounded-xl p-3">
              <Text className="text-sm text-sand italic font-sans-medium">{quote}</Text>
            </View>
          )}

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-32 rounded-xl mt-2"
              resizeMode="cover"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}
