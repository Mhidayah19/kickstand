import { View, Text, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

interface ProfileHeroProps {
  name?: string;
  role?: string;
  avatarUri?: string;
  onAvatarPress?: () => void;
  onAvatarRemove?: () => void;
}

export function ProfileHero({ name, role, avatarUri, onAvatarPress, onAvatarRemove }: ProfileHeroProps) {
  const avatarCircle = (
    <View className="w-24 h-24 rounded-full overflow-hidden mb-4" style={{ borderWidth: 4, borderColor: colors.surfaceCard }}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} className="w-full h-full" />
      ) : (
        <View className="w-full h-full bg-sand/30 items-center justify-center">
          {onAvatarPress && (
            <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.sand} />
          )}
        </View>
      )}
    </View>
  );

  return (
    <View className="relative overflow-hidden bg-surface-low rounded-3xl p-8 items-center">
      {/* Decorative circles */}
      <View
        className="absolute rounded-full bg-yellow/10"
        style={{ width: 192, height: 192, top: -48, right: -48 }}
      />
      <View
        className="absolute rounded-full bg-sand/10"
        style={{ width: 192, height: 192, bottom: -48, left: -48 }}
      />

      {/* Content */}
      <View className="z-10 items-center">
        {onAvatarPress ? (
          <View className="items-center">
            <Pressable onPress={onAvatarPress} className="active:opacity-70">
              {avatarCircle}
            </Pressable>
            {onAvatarRemove && (
              <Pressable onPress={onAvatarRemove} className="active:opacity-70 -mt-2 mb-2">
                <Text className="font-sans-bold text-xs text-danger">Remove</Text>
              </Pressable>
            )}
          </View>
        ) : (
          avatarCircle
        )}
        {name && <Text className="font-sans-xbold text-2xl text-charcoal mb-1">{name}</Text>}
        {role && (
          <View className="bg-charcoal px-3 py-1 rounded-full">
            <Text className="font-sans-bold text-xxs text-white uppercase tracking-wide-1">
              {role}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
