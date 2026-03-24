import { View, Text, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface BikeImageCardProps {
  make: string;
  model: string;
  imageUri?: string;
  status: 'ready' | 'overdue';
  battery?: { value: number; status: string };
  tires?: { value: number; unit: string; status?: string };
  mileage?: { value: number; unit: string };
  onPress: () => void;
  onMenuPress?: () => void;
}

export function BikeImageCard({
  make,
  model,
  imageUri,
  status,
  battery,
  tires,
  mileage,
  onPress,
  onMenuPress,
}: BikeImageCardProps) {
  const isOverdue = status === 'overdue';

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-3xl overflow-hidden border border-charcoal/5"
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
      ]}
    >
      {/* Hero Image */}
      <View className="relative h-56 overflow-hidden">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full bg-surface-low items-center justify-center">
            <MaterialCommunityIcons name="motorbike" size={48} color={colors.outline} />
          </View>
        )}
        {/* Status Badge */}
        <View className="absolute top-4 left-4">
          <View className={`px-3 py-1 rounded-full ${isOverdue ? 'bg-danger' : 'bg-yellow'}`}>
            <Text className={`font-sans-xbold text-xxs uppercase tracking-widest ${isOverdue ? 'text-white' : 'text-charcoal'}`}>
              {isOverdue ? 'Service Overdue' : 'Ready to Ride'}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-6">
        <View className="flex-row justify-between items-start mb-4">
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">
              {make}
            </Text>
            <Text className="font-sans-xbold text-xl text-charcoal">{model}</Text>
          </View>
          {onMenuPress && (
            <Pressable onPress={onMenuPress} hitSlop={8} className="active:opacity-70">
              <MaterialCommunityIcons name="dots-vertical" size={20} color={colors.outline} />
            </Pressable>
          )}
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-3">
          {battery && (
            <View className="flex-1 bg-surface-low/50 px-4 py-3 rounded-2xl">
              <Text className="font-sans-bold text-xxs text-sand uppercase mb-1">Battery</Text>
              <Text className="font-sans-bold text-sm text-charcoal">
                {battery.value}%{' '}
                <Text className={`text-xxs ${battery.value < 20 ? 'text-danger' : 'text-success'}`}>
                  {battery.status}
                </Text>
              </Text>
            </View>
          )}
          {tires && (
            <View className="flex-1 bg-surface-low/50 px-4 py-3 rounded-2xl">
              <Text className="font-sans-bold text-xxs text-sand uppercase mb-1">Tires</Text>
              <Text className="font-sans-bold text-sm text-charcoal">
                {tires.value}{' '}
                <Text className={`text-xxs font-sans-medium ${tires.status === 'Low' ? 'text-danger' : 'text-charcoal/50'}`}>
                  {tires.unit}
                </Text>
              </Text>
            </View>
          )}
          {mileage && (
            <View className="flex-1 bg-surface-low/50 px-4 py-3 rounded-2xl">
              <Text className="font-sans-bold text-xxs text-sand uppercase mb-1">Mileage</Text>
              <Text className="font-sans-bold text-sm text-charcoal">
                {mileage.value.toLocaleString()}{' '}
                <Text className="text-xxs font-sans-medium text-charcoal/50">
                  {mileage.unit}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
