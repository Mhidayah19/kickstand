import { View, Text, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../lib/colors';

const MAIN_TAB_PATHS = new Set(['/', '/garage', '/service', '/settings']);

interface TopAppBarProps {
  activeBike?: {
    id: string;
    model: string;
    year: number;
  };
  bikes?: Array<{
    id: string;
    model: string;
    year: number;
  }>;
  onBikeChange?: (bikeId: string) => void;
  onNotificationPress?: () => void;
  onAddBikePress?: () => void;
  unreadNotifications?: number;
}

export function TopAppBar({
  activeBike,
  bikes = [],
  onBikeChange,
  onNotificationPress,
  onAddBikePress,
  unreadNotifications = 0,
}: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [bikeMenuOpen, setBikeMenuOpen] = useState(false);

  if (!MAIN_TAB_PATHS.has(pathname)) return null;

  const getBikeEmoji = (model: string) => {
    const lower = model.toLowerCase();
    if (lower.includes('sport') || lower.includes('ninja')) return '🏍️';
    if (lower.includes('cruiser') || lower.includes('rebel')) return '🛵';
    if (lower.includes('adventure') || lower.includes('gs')) return '🏔️';
    return '🏍️';
  };

  const activeBikeEmoji = activeBike ? getBikeEmoji(activeBike.model) : '🏍️';

  return (
    <>
      <BlurView
        intensity={70}
        tint="light"
        className="absolute top-0 left-0 right-0 z-50"
      >
        <View
          className="flex-row items-center justify-between px-6 pb-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          {/* Left: Bike Button + Name */}
          <Pressable
            onPress={() => setBikeMenuOpen(true)}
            hitSlop={8}
            className="flex-row items-center gap-2 active:opacity-60"
          >
            <View className="w-10 h-10 rounded-full bg-sand/20 items-center justify-center">
              <Text className="text-xl">{activeBikeEmoji}</Text>
            </View>
            {activeBike && (
              <View className="flex-row items-center gap-1">
                <View>
                  <Text
                    className="font-sans-bold text-sm text-charcoal tracking-wide-1 uppercase leading-none"
                    numberOfLines={1}
                  >
                    {activeBike.model}
                  </Text>
                  <Text className="font-sans-medium text-xs text-sand leading-none mt-0.5">
                    {activeBike.year}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={14} color={colors.sand} />
              </View>
            )}
          </Pressable>

          {/* Right: Notification Bell */}
          <Pressable
            onPress={onNotificationPress}
            hitSlop={8}
            className="relative w-10 h-10 rounded-full bg-sand/20 items-center justify-center active:opacity-70"
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.charcoal} />
            {unreadNotifications > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger items-center justify-center">
                <Text className="text-xs font-sans-bold text-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </BlurView>

      {/* Bike Switcher Modal */}
      <Modal
        visible={bikeMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBikeMenuOpen(false)}
      >
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0 bg-charcoal/40"
          onPress={() => setBikeMenuOpen(false)}
        />

        {/* Modal Content */}
        <View className="flex-1 justify-end">
          <View className="pb-8">
            <View className="mx-6 rounded-3xl overflow-hidden bg-surface-card">
              {/* Header */}
              <View className="px-6 pt-5 pb-4">
                <Text className="font-sans-xbold text-lg text-charcoal">Select Bike</Text>
              </View>

              {/* Bike List */}
              <View>
                {bikes.map((bike) => (
                  <Pressable
                    key={bike.id}
                    onPress={() => {
                      onBikeChange?.(bike.id);
                      setBikeMenuOpen(false);
                    }}
                    className="px-6 py-4 flex-row items-center justify-between active:bg-surface-low"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text className="text-lg">{getBikeEmoji(bike.model)}</Text>
                      <View className="flex-1">
                        <Text className="text-base font-sans-bold text-charcoal">
                          {bike.model}
                        </Text>
                        <Text className="text-xs font-sans-medium text-sand">{bike.year}</Text>
                      </View>
                    </View>
                    {activeBike?.id === bike.id && (
                      <View className="w-2 h-2 rounded-full bg-yellow" />
                    )}
                  </Pressable>
                ))}
              </View>

              {/* Add Bike Action */}
              <Pressable
                onPress={() => {
                  setBikeMenuOpen(false);
                  onAddBikePress?.();
                }}
                className="px-6 py-4 flex-row items-center gap-3 bg-surface-low active:opacity-70"
              >
                <MaterialCommunityIcons name="plus" size={22} color={colors.charcoal} />
                <Text className="text-base font-sans-bold text-charcoal">Add Bike</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
