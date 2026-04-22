import React, { useCallback, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, RadialGradient, Stop } from 'react-native-svg';
import { useBikes } from '../../lib/api/use-bikes';
import { useBikeStore } from '../../lib/store/bike-store';
import { useProfile, useUpdateProfile } from '../../lib/api/use-profile';
import { useImageUpload } from '../../lib/hooks/use-image-upload';
import { useSignOut } from '../../lib/api/use-auth';
import { TopBar, Eyebrow, Row, Icon, BikeSwitcher } from '../../components/ui/atelier';

function AvatarPlaceholder() {
  return (
    <Svg viewBox="0 0 76 76" width={76} height={76} style={{ borderRadius: 38 }}>
      <Defs>
        <RadialGradient id="av-bg" cx="40%" cy="35%" r="75%">
          <Stop offset="0%" stopColor="#F7E4AD" />
          <Stop offset="100%" stopColor="#7A6B3A" />
        </RadialGradient>
        <ClipPath id="av-clip">
          <Circle cx={38} cy={38} r={37} />
        </ClipPath>
      </Defs>
      <Circle cx={38} cy={38} r={38} fill="url(#av-bg)" />
      <G clipPath="url(#av-clip)">
        <Circle cx={38} cy={30} r={13} fill="rgba(255,255,255,0.88)" />
        <Ellipse cx={38} cy={70} rx={24} ry={20} fill="rgba(255,255,255,0.7)" />
      </G>
      <Ellipse cx={28} cy={24} rx={9} ry={6} fill="rgba(255,255,255,0.3)" />
    </Svg>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: bikes } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const [bikeSwitcherOpen, setBikeSwitcherOpen] = useState(false);
  const { data: profile } = useProfile();
  const activeBike = bikes?.find((b) => b.id === activeBikeId);
  const updateProfile = useUpdateProfile();
  const signOut = useSignOut();
  const { pickAndUpload: pickAvatar } = useImageUpload({
    bucket: 'avatars',
    prefix: profile?.id ?? 'unknown',
    dialogTitle: 'Profile Photo',
  });

  const onProfileMutationSuccess = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleAvatarUpload = useCallback(async () => {
    const result = await pickAvatar();
    if (!result) return;
    updateProfile.mutate({ avatarUrl: result.publicUrl }, { onSuccess: onProfileMutationSuccess });
  }, [pickAvatar, updateProfile, onProfileMutationSuccess]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- preserved for long-press / context-menu removal (phase-3)
  const handleAvatarRemove = useCallback(() => {
    updateProfile.mutate({ avatarUrl: null }, { onSuccess: onProfileMutationSuccess });
  }, [updateProfile, onProfileMutationSuccess]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut.mutateAsync();
      router.replace('/(onboarding)' as any);
    } catch {
      // surface via existing toast/alert if desired; for now swallow
    }
  }, [signOut, router]);

  return (
    <View className="flex-1 bg-bg">
      <TopBar
        bike={activeBike ? `${activeBike.model}${activeBike.year ? ` · ${activeBike.year}` : ''}` : 'Garage'}
        unread={0}
        onBikePress={() => setBikeSwitcherOpen(true)}
        onBellPress={() => router.push('/notifications' as any)}
      />

      <BikeSwitcher
        visible={bikeSwitcherOpen}
        onClose={() => setBikeSwitcherOpen(false)}
        bikes={bikes ?? []}
        activeBikeId={activeBikeId}
        onSelect={setActiveBikeId}
        onAddBike={() => router.push('/add-bike')}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Avatar + name header */}
        <View className="px-5 pt-8 pb-2.5 flex-row gap-4 items-center">
          <View className="w-[76px] h-[76px]">
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                className="w-[76px] h-[76px] rounded-full"
              />
            ) : (
              <AvatarPlaceholder />
            )}
            <Pressable
              onPress={handleAvatarUpload}
              className="absolute bottom-[-1px] right-[-1px] w-6 h-6 rounded-full bg-ink items-center justify-center"
              style={{ borderWidth: 2, borderColor: '#F4F2EC' }}
            >
              <Icon name="camera" size={11} stroke="#F4F2EC" />
            </Pressable>
          </View>
          <View className="flex-1">
            <Eyebrow>Account</Eyebrow>
            <Text className="font-display text-[34px] leading-[1.05] text-ink mt-1">
              {profile?.name ?? 'You'}
            </Text>
            <Text className="font-mono text-[10px] text-muted mt-1 tracking-[0.08em]">
              {(profile?.email ?? '').toUpperCase()}
              {profile?.createdAt ? ` · SINCE ${new Date(profile.createdAt).getFullYear()}` : ''}
            </Text>
          </View>
        </View>

        {/* Settings */}
        <View className="px-5 pt-7 pb-2">
          <Text className="font-sans-semibold text-[13px] text-ink mb-2 tracking-[-0.01em]">Settings</Text>
          <Row
            icon="bell"
            title="Notifications"
            sub="Service, compliance, seasonal"
            chevron
            // TODO(phase-4): wire once sub-screen exists
            onPress={() => {}}
          />
          <Row
            icon="receipt"
            title="Data & export"
            sub="CSV, backup, privacy"
            chevron
            // TODO(phase-4): wire once sub-screen exists
            onPress={() => {}}
          />
          <Row
            icon="sparkle"
            title="Kickstand Pro"
            sub="Unlimited bikes · S$29/yr"
            chevron
            // TODO(phase-4): wire once sub-screen exists
            onPress={() => {}}
          />
          <Row
            icon="settings"
            title="Preferences"
            sub="Units, language, theme"
            chevron
            // TODO(phase-4): wire once sub-screen exists
            onPress={() => {}}
          />
        </View>

        {/* Version + Log Out */}
        <View className="px-5 pt-5">
          <Text className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted text-center mb-3">
            KICKSTAND · V 4.2.0
          </Text>
          <Pressable
            onPress={handleSignOut}
            className="py-[14px] border-b border-hairline flex-row items-center gap-[14px]"
          >
            <View
              className="w-10 h-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
            >
              <Icon name="close" size={18} stroke="#DC2626" />
            </View>
            <Text className="font-sans-semibold text-[15px] text-danger flex-1">Log out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
