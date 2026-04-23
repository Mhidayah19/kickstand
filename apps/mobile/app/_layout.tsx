import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, router, useNavigationContainerRef, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  captureAndPush,
  clearScreenshotBuffer,
  getCurrentRoute,
  getNavigationHistory,
  getScreenshotAttachments,
} from '../lib/sentry/screen-tracker';
import { getPendingFeedbackType, setPendingFeedbackType } from '../lib/sentry/feedback-state';
import { useAppFonts } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store/auth-store';
import { justRegisteredRef } from '../lib/auth-state';
import { apiClient } from '../lib/api/client';
import { PortalHost } from '@rn-primitives/portal';
import type { UserProfile } from '../lib/types/profile';
import '../global.css';

const navigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    navigationIntegration,
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
    Sentry.feedbackIntegration({
      showName: false,
      showEmail: false,
      onFormSubmitted: () => {
        clearScreenshotBuffer();
        setPendingFeedbackType(null);
      },
    }),
  ],
  environment: __DEV__ ? 'development' : 'production',
  enableNativeFramesTracking: !isRunningInExpoGo(),
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
});

Sentry.addEventProcessor((event, hint) => {
  if (event.type === 'feedback') {
    event.contexts = {
      ...event.contexts,
      navigation: {
        current_route: getCurrentRoute(),
        history: getNavigationHistory(),
      },
    };
    const feedbackType = getPendingFeedbackType();
    if (feedbackType) {
      event.tags = { ...event.tags, feedback_type: feedbackType };
    }
    const screenshots = getScreenshotAttachments();
    if (screenshots.length > 0) {
      hint.attachments = [...(hint.attachments ?? []), ...screenshots];
    }
  }
  return event;
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

function getRoutePath(state: { routes: { name: string; state?: unknown }[]; index?: number }): string {
  const route = state.routes[state.index ?? state.routes.length - 1];
  const name = route?.name === '__root' ? '' : route?.name ?? 'unknown';
  if (route?.state) {
    const child = getRoutePath(route.state as typeof state);
    return name ? `${name}/${child}` : child;
  }
  return name;
}

function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  const setUser = useAuthStore((s) => s.setUser);
  const navigationRef = useNavigationContainerRef();
  const screenshotTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segments = useSegments();
  const inTabsRef = useRef(false);
  inTabsRef.current = segments[0] === '(tabs)';

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', (e) => {
      if (!e.data.state) return;
      const path = getRoutePath(e.data.state);
      if (screenshotTimer.current) clearTimeout(screenshotTimer.current);
      screenshotTimer.current = setTimeout(() => {
        screenshotTimer.current = null;
        void captureAndPush(path);
      }, 300);
    });

    return unsubscribe;
  }, [navigationRef]);

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

      const initialName = supabaseUser.user_metadata?.name ?? '';
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: initialName,
        activeBikeId: null,
        expoToken: null,
      });
      Sentry.setUser({ id: supabaseUser.id, email: supabaseUser.email ?? undefined, username: initialName });

      apiClient.get<UserProfile>('/users/me').then((profile) => {
        if (cancelled) return;
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          activeBikeId: null,
          expoToken: null,
        });
        Sentry.setUser({ id: profile.id, email: profile.email, username: profile.name });
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
        hydrateUser(session.user);
        if (justRegisteredRef.current) {
          justRegisteredRef.current = false;
          return;
        }
        router.replace('/(tabs)');
      } else if (event === 'SIGNED_OUT') {
        Sentry.setUser(null);
        setUser(null);
        if (inTabsRef.current) {
          router.replace('/(onboarding)');
        }
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-bike" options={{ presentation: 'modal', gestureEnabled: false }} />
          <Stack.Screen name="add-service" options={{ presentation: 'modal', gestureEnabled: false }} />
          <Stack.Screen name="edit-service" options={{ presentation: 'modal', gestureEnabled: false }} />
          <Stack.Screen name="quick-log" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="scan-receipt" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ocr-analyzing" options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="workshop-manual" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="prediction" options={{ headerShown: false }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <PortalHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
