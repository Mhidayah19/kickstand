import { View, Pressable, Keyboard } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';

const TAB_ICONS: Record<string, string> = {
  index: 'wrench',
  'garage/index': 'motorbike',
  agent: 'microphone',
  log: 'chart-bar',
  settings: 'cog',
};

interface FloatingTabBarProps extends BottomTabBarProps {
  onAgentPress?: () => void;
}

export function FloatingTabBar({ state, navigation, onAgentPress }: FloatingTabBarProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (keyboardVisible) return null;

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <BlurView
        intensity={80}
        tint="dark"
        className="w-[90%] max-w-md rounded-3xl overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.1,
          shadowRadius: 40,
          elevation: 10,
        }}
      >
        <View className="flex-row items-center justify-between px-8 py-3">
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const isCenter = route.name === 'agent';
            const iconName = TAB_ICONS[route.name] || 'help-circle';

            const onPress = () => {
              if (isCenter) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onAgentPress?.();
                return;
              }
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (isCenter) {
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  className="bg-yellow rounded-full p-3 active:opacity-80"
                  style={{ transform: [{ scale: 1.1 }] }}
                >
                  <MaterialCommunityIcons name={iconName as any} size={24} color="#1E1E1E" />
                </Pressable>
              );
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="p-3 active:opacity-70"
              >
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={24}
                  color={isFocused ? '#F2D06B' : '#C7B299'}
                />
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
