import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { useAppFonts } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store/auth-store';
import { justRegisteredRef } from '../lib/auth-state';
import '../global.css';

SplashScreen.preventAutoHideAsync();


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? '',
          name: data.session.user.user_metadata?.name ?? '',
          activeBikeId: null,
          expoToken: null,
        });
      } else if (__DEV__ && process.env.EXPO_PUBLIC_DEV_EMAIL && process.env.EXPO_PUBLIC_DEV_PASSWORD) {
        await supabase.auth.signInWithPassword({
          email: process.env.EXPO_PUBLIC_DEV_EMAIL,
          password: process.env.EXPO_PUBLIC_DEV_PASSWORD,
        });
      } else {
        router.replace('/(onboarding)' as any);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name ?? '',
          activeBikeId: null,
          expoToken: null,
        });
        if (justRegisteredRef.current) {
          justRegisteredRef.current = false;
          return;
        }
        router.replace('/(tabs)' as any);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.replace('/(onboarding)' as any);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
