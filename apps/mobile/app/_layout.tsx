import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { useAppFonts } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store/auth-store';
import { justRegisteredRef } from '../lib/auth-state';
import { apiClient } from '../lib/api/client';
import { PortalHost } from '@rn-primitives/portal';
import type { UserProfile } from '../lib/types/profile';
import '../global.css';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
    Sentry.feedbackIntegration(),
  ],
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

SplashScreen.preventAutoHideAsync();


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    let cancelled = false;
    let hydrated = false;

    function hydrateUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, string> }) {
      if (hydrated) return;
      hydrated = true;

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.name ?? '',
        activeBikeId: null,
        expoToken: null,
      });

      apiClient.get<UserProfile>('/users/me').then((profile) => {
        if (cancelled) return;
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          activeBikeId: null,
          expoToken: null,
        });
      }).catch(() => {});
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        hydrateUser(data.session.user);
        router.replace('/(tabs)');
      } else if (__DEV__ && process.env.EXPO_PUBLIC_DEV_EMAIL && process.env.EXPO_PUBLIC_DEV_PASSWORD) {
        await supabase.auth.signInWithPassword({
          email: process.env.EXPO_PUBLIC_DEV_EMAIL,
          password: process.env.EXPO_PUBLIC_DEV_PASSWORD,
        });
      } else {
        router.replace('/(onboarding)');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        Sentry.setUser({ id: session.user.id, email: session.user.email ?? undefined });
        hydrateUser(session.user);
        if (justRegisteredRef.current) {
          justRegisteredRef.current = false;
          return;
        }
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT') {
        Sentry.setUser(null);
        setUser(null);
        router.replace('/(onboarding)');
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setUser]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-bike" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="add-service" options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <PortalHost />
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
