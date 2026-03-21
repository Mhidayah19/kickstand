import { View, Text, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopAppBarProps {
  onNotificationPress?: () => void;
}

export function TopAppBar({ onNotificationPress }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={70}
      tint="light"
      className="absolute top-0 left-0 right-0 z-50"
    >
      <View className="flex-row items-center justify-between px-6 pb-4" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-sand/30 overflow-hidden">
            <Image
              source={{ uri: 'https://via.placeholder.com/32' }}
              className="w-full h-full"
            />
          </View>
          <Text className="font-sans-bold text-sm text-charcoal uppercase tracking-wide-2">
            PRECISION ATELIER
          </Text>
        </View>
        <Pressable
          onPress={onNotificationPress}
          hitSlop={8}
          className="active:opacity-70"
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color="#1E1E1E" />
        </Pressable>
      </View>
    </BlurView>
  );
}
