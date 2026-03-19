import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppFonts } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function NavigationStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          activeBikeId: null,
          expoToken: null,
        });
      }
      setIsReady(true);
    }).catch(() => {
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          activeBikeId: null,
          expoToken: null,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if ((!fontsLoaded && !fontError) || !isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#faf8f5', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#78716c', fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationStack />
      {isReady && !isAuthenticated && <Redirect href="/(auth)/login" />}
      {isReady && isAuthenticated && <Redirect href="/(tabs)" />}
    </QueryClientProvider>
  );
}
