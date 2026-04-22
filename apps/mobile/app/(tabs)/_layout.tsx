import { View } from 'react-native';
import { Tabs, router, useSegments } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TabBar, TabId } from '../../components/ui/atelier/TabBar';
import { FeedbackButton } from '../../components/ui/feedback-button';

function tabIdFromSegment(segment: string | undefined): TabId {
  switch (segment) {
    case 'garage':   return 'garage';
    case 'service':  return 'service';
    case 'settings': return 'profile';
    default:         return 'home';
  }
}

export default function TabLayout() {
  const segments = useSegments();
  const current = tabIdFromSegment(segments[1]);

  const go = (id: TabId) => {
    switch (id) {
      case 'home':    router.navigate('/(tabs)'); break;
      case 'garage':  router.navigate('/(tabs)/garage'); break;
      case 'service': router.navigate('/(tabs)/service'); break;
      case 'profile': router.navigate('/(tabs)/settings'); break;
    }
  };

  const openAddService = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-service');
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={() => null}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="garage" />
        <Tabs.Screen name="service" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <TabBar active={current} onChange={go} onAdd={openAddService} />
      <FeedbackButton />
    </View>
  );
}
