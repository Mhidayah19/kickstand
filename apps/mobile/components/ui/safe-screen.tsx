import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopAppBar } from './top-app-bar';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showAppBar?: boolean;
  className?: string;
}

export function SafeScreen({ children, scrollable = true, showAppBar = true, className = '' }: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-surface ${className}`}>
      {showAppBar && <TopAppBar />}
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
