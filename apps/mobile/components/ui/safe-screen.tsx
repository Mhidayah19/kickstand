import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TopAppBar } from './top-app-bar';
import { useAttention } from '../../lib/api/use-attention';
import { useBikeStore } from '../../lib/store/bike-store';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showAppBar?: boolean;
  className?: string;
  activeBike?: {
    id: string;
    model: string;
    year: number;
  };
  bikes?: Array<{
    id: string;
    model: string;
    year: number;
  }>;
  onBikeChange?: (bikeId: string) => void;
  onNotificationPress?: () => void;
  onAddBikePress?: () => void;
  unreadNotifications?: number;
}

export function SafeScreen({
  children,
  scrollable = true,
  showAppBar = true,
  className = '',
  activeBike,
  bikes,
  onBikeChange,
  onNotificationPress,
  onAddBikePress,
  unreadNotifications,
}: SafeScreenProps) {
  const router = useRouter();
  const { activeBikeId } = useBikeStore();
  const { data: attention } = useAttention(activeBikeId);

  const badgeCount = unreadNotifications ?? (attention?.summary.needsAttention ?? 0);
  const handleNotificationPress = onNotificationPress ?? (() => router.push('/notifications' as any));

  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {showAppBar && (
        <TopAppBar
          activeBike={activeBike}
          bikes={bikes}
          onBikeChange={onBikeChange}
          onNotificationPress={handleNotificationPress}
          onAddBikePress={onAddBikePress}
          unreadNotifications={badgeCount}
        />
      )}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: showAppBar ? 80 : 16, paddingBottom: 128, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6" style={{ paddingTop: showAppBar ? 80 : 16 }}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
