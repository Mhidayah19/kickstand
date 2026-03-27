import { View, Pressable, Keyboard } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import { colors } from '../../lib/colors';
import { useRouter } from 'expo-router';

const TAB_ICONS: Record<string, string> = {
  index: 'home',
  'garage/index': 'motorbike',
  'service/index': 'clipboard-text-outline',
  settings: 'account-circle',
};

const TAB_ORDER = ['index', 'garage/index', 'service/index', 'settings'];

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const currentRouteName = state.routes[state.index]?.name;
  const isValidRoute = TAB_ORDER.includes(currentRouteName as string);
  if (keyboardVisible || !isValidRoute) return null;

  const getRouteKey = (name: string) => state.routes.find((r) => r.name === name)?.key ?? '';

  const handleTabPress = (routeName: string) => {
    const routeKey = getRouteKey(routeName);
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (currentRouteName !== routeName && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleAddService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/service/add');
  };

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <BlurView
        intensity={80}
        tint="dark"
        className="w-[90%] max-w-lg rounded-3xl overflow-hidden"
      >
        <View className="flex-row items-center justify-between px-6 py-3">
          {/* Dashboard */}
          <Pressable
            onPress={() => handleTabPress('index')}
            className="p-3 active:opacity-70"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="home"
              size={24}
              color={currentRouteName === 'index' ? colors.yellow : colors.sand}
            />
          </Pressable>

          {/* Garage */}
          <Pressable
            onPress={() => handleTabPress('garage/index')}
            className="p-3 active:opacity-70"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="motorbike"
              size={24}
              color={currentRouteName === 'garage/index' ? colors.yellow : colors.sand}
            />
          </Pressable>

          {/* Center: Add Service Button */}
          <Pressable
            onPress={handleAddService}
            className="bg-yellow rounded-full p-3 active:opacity-80 mx-2"
            style={{ transform: [{ scale: 1.15 }] }}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="plus" size={28} color={colors.charcoal} />
          </Pressable>

          {/* Services */}
          <Pressable
            onPress={() => handleTabPress('service/index')}
            className="p-3 active:opacity-70"
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={24}
              color={currentRouteName === 'service/index' ? colors.yellow : colors.sand}
            />
          </Pressable>

          {/* Profile/Settings */}
          <Pressable
            onPress={() => handleTabPress('settings')}
            className="p-3 active:opacity-70"
            hitSlop={8}
          >
            <View className="w-6 h-6 rounded-full bg-sand/40 items-center justify-center">
              <MaterialCommunityIcons
                name="account-circle"
                size={24}
                color={currentRouteName === 'settings' ? colors.yellow : colors.sand}
              />
            </View>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}
