import React from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen } from './ui/safe-screen';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const motorcycleImage = require('../assets/images/motorcycle.png');

const ICON_SIZE = 20;

const FEATURES = [
  { icon: 'chart-bar' as const, label: 'Track', active: true },
  { icon: 'shield-check-outline' as const, label: 'Legal', active: false },
  { icon: 'wrench' as const, label: 'Service', active: false },
  { icon: 'microphone' as const, label: 'Voice', active: false },
  { icon: 'white-balance-sunny' as const, label: 'Trips', active: false },
];

export function WelcomeScreen() {
  return (
    <SafeScreen>
      <View className="flex-1 pt-lg">

        {/* Card — fixed at 42% of screen height */}
        <View className="bg-surface-muted rounded-2xl px-lg pt-xl pb-xl" style={{ height: SCREEN_HEIGHT * 0.42 }}>
          <Text className="text-4xl font-sans-bold text-text-primary tracking-widest mb-md">
            KICKSTAND
          </Text>
          <View className="flex-1 items-center justify-center">
            <Image
              source={motorcycleImage}
              style={{ width: 220, height: 180 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Headline — flex-1 fills all remaining space between card and bottom */}
        <View className="flex-1 justify-center" style={{ width: '80%' }}>
          <Text className="font-sans-bold text-text-primary" style={{ fontSize: 36, lineHeight: 46, letterSpacing: -0.5 }}>
            Track your ride,{'\n'}stay road-legal,{'\n'}
            <View className="rounded-md px-xs" style={{ backgroundColor: 'rgba(217, 119, 6, 0.22)', transform: [{ translateY: 5 }] }}>
              <Text className="font-sans-bold text-text-primary" style={{ fontSize: 36, letterSpacing: -0.5 }}>
                ride easy.
              </Text>
            </View>
          </Text>
        </View>

        {/* Features + CTA — pinned at bottom */}
        <View className="flex-row justify-between mb-lg">
          {FEATURES.map(({ icon, label, active }, i) => (
            <View key={i} className="items-center gap-xs flex-1">
              <View className={`w-12 h-12 rounded-full items-center justify-center ${active ? 'bg-charcoal' : 'bg-surface-low'}`}>
                <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={active ? '#faf8f5' : '#1c1917'} />
              </View>
              <Text className={`text-xs font-sans-semibold ${active ? 'text-text-primary' : 'text-text-muted'}`}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="bg-hero py-lg rounded-full items-center"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }}
          onPress={() => router.push('/(tabs)/garage/add')}
          activeOpacity={0.8}
        >
          <Text className="text-hero-text font-sans-bold text-base">Get started</Text>
        </TouchableOpacity>

      </View>
    </SafeScreen>
  );
}
