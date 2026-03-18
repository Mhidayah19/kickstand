import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
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

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Hydrate auth state from existing session
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
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          activeBikeId: null,
          expoToken: null,
        });
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
