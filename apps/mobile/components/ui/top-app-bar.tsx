import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../lib/colors';

interface TopAppBarProps {
  onNotificationPress?: () => void;
  onMorePress?: () => void;
}

export function TopAppBar({ onNotificationPress, onMorePress }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={70}
      tint="light"
      className="absolute top-0 left-0 right-0 z-50"
    >
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-sand/30 items-center justify-center">
            <MaterialCommunityIcons name="account-circle" size={28} color={colors.sand} />
          </View>
          <Text className="font-sans-bold text-sm text-charcoal uppercase tracking-wide-2">
            PRECISION ATELIER
          </Text>
        </View>
        {onMorePress ? (
          <Pressable onPress={onMorePress} hitSlop={8} className="active:opacity-70">
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.charcoal} />
          </Pressable>
        ) : (
          <Pressable onPress={onNotificationPress} hitSlop={8} className="active:opacity-70">
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.charcoal} />
          </Pressable>
        )}
      </View>
    </BlurView>
  );
}
