import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 bg-bg items-center justify-center px-lg">
        <Text className="text-xl font-sans-bold text-ink mb-sm">Page not found</Text>
        <Link href="/(tabs)" className="text-yellow font-sans-medium text-sm">
          Go to home
        </Link>
      </View>
    </>
  );
}
