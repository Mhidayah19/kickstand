import { View, Text, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useState } from 'react';
import { Icon } from './atelier';
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
          {/* Left: Bike avatar + name */}
          <Pressable
            onPress={() => setBikeMenuOpen(true)}
            hitSlop={8}
            className="flex-row items-center gap-2 active:opacity-60"
          >
            <View className="w-10 h-10 rounded-full bg-bg-2 items-center justify-center">
              <Icon name="bike" size={20} stroke={colors.ink} />
            </View>
            {activeBike && (
              <View className="flex-row items-center gap-1">
                <View>
                  <Text
                    className="font-sans-bold text-sm text-ink tracking-wide-1 uppercase leading-none"
                    numberOfLines={1}
                  >
                    {activeBike.model}
                  </Text>
                  <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted leading-none mt-1">
                    {activeBike.year}
                  </Text>
                </View>
                <Icon name="chevron" size={12} stroke={colors.muted} />
              </View>
            )}
          </Pressable>

          {/* Right: Notification bell */}
          <Pressable
            onPress={onNotificationPress}
            hitSlop={8}
            className="relative w-10 h-10 rounded-full bg-bg-2 items-center justify-center active:opacity-70"
          >
            <Icon name="bell" size={20} stroke={colors.ink} />
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

      {/* Bike switcher */}
      <Modal
        visible={bikeMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBikeMenuOpen(false)}
      >
        <Pressable
          className="absolute inset-0 bg-ink/40"
          onPress={() => setBikeMenuOpen(false)}
        />

        <View className="flex-1 justify-end">
          <View className="pb-8">
            <View className="mx-6 rounded-[28px] overflow-hidden bg-surface">
              <View className="px-6 pt-5 pb-3">
                <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                  Select Bike
                </Text>
              </View>

              <View>
                {bikes.map((bike) => (
                  <Pressable
                    key={bike.id}
                    onPress={() => {
                      onBikeChange?.(bike.id);
                      setBikeMenuOpen(false);
                    }}
                    className="px-6 py-4 flex-row items-center justify-between active:bg-bg-2"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-9 h-9 rounded-full bg-bg-2 items-center justify-center">
                        <Icon name="bike" size={18} stroke={colors.ink} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-sans-semibold text-ink">
                          {bike.model}
                        </Text>
                        <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-0.5">
                          {bike.year}
                        </Text>
                      </View>
                    </View>
                    {activeBike?.id === bike.id && (
                      <View className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => {
                  setBikeMenuOpen(false);
                  onAddBikePress?.();
                }}
                className="px-6 py-4 flex-row items-center gap-3 bg-bg-2 active:opacity-70"
              >
                <Icon name="plus" size={18} stroke={colors.ink} />
                <Text className="text-base font-sans-semibold text-ink">Add bike</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
