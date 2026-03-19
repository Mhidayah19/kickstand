import React from 'react';
import { Text } from 'react-native';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';

export default function SettingsScreen() {
  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Settings" />
      <Text className="text-sm font-sans text-muted text-center mt-xl">Settings — coming soon</Text>
    </SafeScreen>
  );
}
