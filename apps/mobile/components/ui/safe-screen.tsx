import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import { TopAppBar } from './top-app-bar';

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
  onAddBikePress?: () => void;
}

export function SafeScreen({
  children,
  scrollable = true,
  showAppBar = true,
  className = '',
  activeBike,
  bikes,
  onBikeChange,
  onAddBikePress,
}: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {showAppBar && (
        <TopAppBar
          activeBike={activeBike}
          bikes={bikes}
          onBikeChange={onBikeChange}
          onFeedbackPress={() => Sentry.showFeedbackWidget()}
          onAddBikePress={onAddBikePress}
        />
      )}
      {scrollable ? (
        <ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 128, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-6" style={{ paddingTop: 80 }}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
