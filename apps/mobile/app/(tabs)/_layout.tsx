import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/ui/floating-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="garage/index" options={{ title: 'Garage' }} />
      <Tabs.Screen name="log" options={{ title: 'Log' }} />
      <Tabs.Screen name="agent" options={{ title: 'Agent' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="garage/add" options={{ href: null }} />
      <Tabs.Screen name="garage/[id]" options={{ href: null }} />
      <Tabs.Screen name="garage/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="garage/[id]/edit" options={{ href: null }} />
      <Tabs.Screen name="garage/[id]/services" options={{ href: null }} />
    </Tabs>
  );
}
