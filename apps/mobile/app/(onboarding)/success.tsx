import React from 'react';
import { Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../lib/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SuccessScreen() {
  const goToDashboard = () => router.replace('/(tabs)');

  return (
    <SafeAreaView className="flex-1 bg-surface px-lg">
      {/* Hero block — echoes slide 1 */}
      <View
        className="bg-charcoal rounded-3xl overflow-hidden justify-end px-lg pb-lg mt-4"
        style={{ height: SCREEN_HEIGHT * 0.45 }}
      >
        <Text
          className="text-white font-sans-bold text-xs tracking-widest uppercase mb-xl"
          style={{ opacity: 0.5 }}
        >
          Precision Atelier
        </Text>
        <Text
          className="text-white font-sans-bold"
          style={{ fontSize: 44, lineHeight: 52, letterSpacing: -1 }}
        >
          Your Garage{'\n'}Awaits.
        </Text>
        <View className="w-8 h-1 bg-yellow rounded-full mt-md" />
      </View>

      {/* Copy */}
      <View className="mt-xl flex-1">
        <Text className="font-sans-medium text-sand text-base">
          Your atelier is ready. Add your first machine to begin the record.
        </Text>
        <View className="flex-row items-center gap-xs mt-lg">
          <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.sand} />
          <Text className="text-xs font-sans-bold text-sand uppercase tracking-widest">
            Account Created
          </Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity
        className="w-full bg-yellow rounded-full py-md items-center flex-row justify-center gap-xs mb-xl"
        onPress={goToDashboard}
        activeOpacity={0.8}
      >
        <Text className="text-charcoal font-sans-bold text-base">Go to Dashboard</Text>
        <Text className="text-charcoal font-sans-bold">→</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
