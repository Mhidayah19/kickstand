import React from 'react';
import { Text } from 'react-native';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ScreenHeader } from '../../components/ui/screen-header';

export default function AgentScreen() {
  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Agent" />
      <Text className="text-sm font-sans text-muted text-center mt-xl">Voice agent — coming soon</Text>
    </SafeScreen>
  );
}
