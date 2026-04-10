import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../components/ui/floating-tab-bar';
import { FeedbackButton } from '../../components/ui/feedback-button';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="garage" />
        <Tabs.Screen name="service" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <FeedbackButton />
    </View>
  );
}
