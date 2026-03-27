import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center">
      <Text className="font-sans-bold text-lg text-charcoal">Service</Text>
    </SafeAreaView>
  );
}
