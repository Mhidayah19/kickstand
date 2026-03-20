import { Tabs } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { FloatingTabBar } from '../../components/ui/floating-tab-bar';
import { BottomSheet } from '../../components/ui/bottom-sheet';

export default function TabLayout() {
  const [agentVisible, setAgentVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <FloatingTabBar {...props} onAgentPress={() => setAgentVisible(true)} />
        )}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="garage/index" />
        <Tabs.Screen name="agent" options={{ href: null }} />
        <Tabs.Screen name="log" />
        <Tabs.Screen name="settings" />
        {/* Hidden routes */}
        <Tabs.Screen name="garage/add" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/edit" options={{ href: null }} />
        <Tabs.Screen name="garage/[id]/services" options={{ href: null }} />
      </Tabs>
      <BottomSheet
        visible={agentVisible}
        onClose={() => setAgentVisible(false)}
        title="Voice Agent"
      >
        <View />
      </BottomSheet>
    </>
  );
}
