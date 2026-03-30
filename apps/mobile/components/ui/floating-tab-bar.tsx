import { View, Pressable, Keyboard, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import { colors } from '../../lib/colors';
import { useRouter, useSegments } from 'expo-router';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const FAB_INDEX = 2;
const HIT_SLOP = 8;
const FAB_STYLE = { transform: [{ scale: 1.15 }] };

const TABS: { routeName: string; icon: IconName; label: string }[] = [
  { routeName: 'index', icon: 'home', label: 'Home' },
  { routeName: 'garage', icon: 'motorbike', label: 'Garage' },
  { routeName: 'service/index', icon: 'clipboard-text-outline', label: 'Service' },
  { routeName: 'settings', icon: 'account-circle', label: 'Profile' },
];

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const segments = useSegments();
  const currentRouteName = state.routes[state.index]?.name;
  const isAtTabRoot = segments.length <= 2; // e.g. ['(tabs)', 'garage'] — depth > 2 means nested screen
  const isValidRoute = TABS.some((t) => t.routeName === currentRouteName) && isAtTabRoot;
  if (keyboardVisible || !isValidRoute) return null;

  const handleTabPress = (routeName: string) => {
    const routeKey = state.routes.find((r) => r.name === routeName)?.key ?? '';
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleAddService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-service');
  };

  const renderTab = ({ routeName, icon, label }: typeof TABS[number]) => {
    const active = currentRouteName === routeName;
    const color = active ? colors.yellow : colors.sand;
    return (
      <Pressable
        key={routeName}
        onPress={() => handleTabPress(routeName)}
        className="flex-1 items-center pt-2 pb-1 active:opacity-70"
        hitSlop={HIT_SLOP}
      >
        <MaterialCommunityIcons name={icon} size={22} color={color} />
        <Text className="font-sans-bold text-xxs uppercase tracking-wide-1 mt-0.5" style={{ color }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <BlurView
        intensity={80}
        tint="dark"
        className="w-[90%] max-w-lg rounded-3xl overflow-hidden"
      >
        <View className="flex-row items-center px-3 py-3">
          {TABS.slice(0, FAB_INDEX).map(renderTab)}

          <Pressable
            onPress={handleAddService}
            className="bg-yellow rounded-full p-3 active:opacity-80 mx-2"
            style={FAB_STYLE}
            hitSlop={HIT_SLOP}
          >
            <MaterialCommunityIcons name="plus" size={28} color={colors.charcoal} />
          </Pressable>

          {TABS.slice(FAB_INDEX).map(renderTab)}
        </View>
      </BlurView>
    </View>
  );
}
