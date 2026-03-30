import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/store/auth-store';
import { supabase } from '../../lib/supabase';

const TAP_THRESHOLD = 3;
const TAP_WINDOW_MS = 500;

interface DevAuthToggleProps {
  children: React.ReactNode;
}

export function DevAuthToggle({ children }: DevAuthToggleProps) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated, setUser } = useAuthStore();

  const handlePress = useCallback(async () => {
    tapCount.current += 1;

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    if (tapCount.current >= TAP_THRESHOLD) {
      tapCount.current = 0;

      if (isAuthenticated) {
        console.log('[DevAuthToggle] Toggling → unauthenticated (onboarding)');
        setUser(null);
        router.replace('/(onboarding)');
      } else {
        console.log('[DevAuthToggle] Toggling → authenticated (restoring session)');
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email ?? '',
            name: data.session.user.user_metadata?.name ?? '',
            activeBikeId: null,
            expoToken: null,
          });
          router.replace('/(tabs)');
        } else {
          console.log('[DevAuthToggle] No Supabase session — cannot restore. Log in once first.');
        }
      }
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_WINDOW_MS);
  }, [isAuthenticated, setUser]);

  useEffect(() => {
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  if (!__DEV__) {
    return <>{children}</>;
  }

  return <Pressable onPress={handlePress}>{children}</Pressable>;
}
