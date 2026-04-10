import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/colors';
import { SafeScreen } from '../../components/ui/safe-screen';
import { ProfileHero } from '../../components/ui/profile-hero';
import { ListCard } from '../../components/ui/list-card';
import { PrimaryButton } from '../../components/ui/primary-button';
import { Section } from '../../components/ui/section';
import { useBikes } from '../../lib/api/use-bikes';
import { useBikeStore } from '../../lib/store/bike-store';
import { useProfile, useUpdateProfile } from '../../lib/api/use-profile';
import { useImageUpload } from '../../lib/hooks/use-image-upload';

export default function SettingsScreen() {
  const router = useRouter();
  const { data: bikes } = useBikes();
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: profile } = useProfile();
  const activeBike = bikes?.find((b) => b.id === activeBikeId);
  const updateProfile = useUpdateProfile();
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

  const handleAvatarRemove = useCallback(() => {
    updateProfile.mutate({ avatarUrl: null }, { onSuccess: onProfileMutationSuccess });
  }, [updateProfile, onProfileMutationSuccess]);

  const handleAddBike = useCallback(() => {
    router.push('/add-bike');
  }, [router]);

  return (
    <SafeScreen
      scrollable
      bikes={bikes?.map((b) => ({ id: b.id, model: b.model, year: b.year })) ?? []}
      activeBike={activeBike && { id: activeBike.id, model: activeBike.model, year: activeBike.year }}
      onBikeChange={setActiveBikeId}
      onAddBikePress={handleAddBike}
    >
      {/* Header */}
      <View className="mb-10">
        <Text className="text-[34px] font-sans-xbold text-charcoal leading-[1.05] tracking-tight">
          {profile?.name ?? '—'}
        </Text>
        <Text className="text-sm font-sans-medium text-charcoal/55 mt-1">
          {profile?.bikeCount ?? 0} {(profile?.bikeCount ?? 0) === 1 ? 'bike' : 'bikes'} in garage
        </Text>
      </View>

      {/* Avatar */}
      <View className="mb-8">
        <ProfileHero
          avatarUri={profile?.avatarUrl ?? undefined}
          onAvatarPress={handleAvatarUpload}
          onAvatarRemove={profile?.avatarUrl ? handleAvatarRemove : undefined}
        />
      </View>

      {/* Account Settings */}
      <Section eyebrow="ACCOUNT">
        <View className="bg-sand/10 rounded-2xl overflow-hidden">
          <ListCard
            icon="account"
            title="Personal Info"
            subtitle="Update your account details"
            onPress={() => {}}
          />
          <ListCard
            icon="shield-lock"
            title="Security"
            subtitle="Password and biometric settings"
            onPress={() => {}}
          />
          <ListCard
            icon="card-account-details"
            title="Subscription"
            subtitle="Manage your Pro membership"
            onPress={() => {}}
          />
        </View>
      </Section>

      {/* Appearance */}
      <Section eyebrow="APPEARANCE">
        <View className="bg-sand/10 rounded-2xl p-5">
          {/* Dark Mode Row */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={colors.charcoal} />
              <Text className="font-sans-bold text-sm text-charcoal">Dark Mode</Text>
            </View>
            {/* Toggle (OFF position, non-interactive) */}
            <View className="w-12 h-7 rounded-full bg-surface-low justify-center px-0.5">
              <View className="w-6 h-6 rounded-full bg-white" style={{ elevation: 2 }} />
            </View>
          </View>

          {/* Accent Color Row */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <MaterialCommunityIcons name="palette" size={20} color={colors.charcoal} />
              <Text className="font-sans-bold text-sm text-charcoal">Accent Color</Text>
            </View>
            <View className="flex-row items-center gap-3">
              {/* Yellow — selected */}
              <View
                className="w-8 h-8 rounded-full bg-yellow"
                style={{ borderWidth: 2, borderColor: colors.yellow, margin: 2 }}
              />
              {/* Sand */}
              <View className="w-8 h-8 rounded-full bg-sand" />
              {/* Charcoal */}
              <View className="w-8 h-8 rounded-full bg-charcoal" />
              {/* Dark */}
              <View className="w-8 h-8 rounded-full" style={{ backgroundColor: '#3A3A3A' }} />
            </View>
          </View>
        </View>
      </Section>

      {/* Log Out Button */}
      <PrimaryButton label="Log Out" onPress={() => {}} />

      {/* Version Footer */}
      <Text className="text-xxs font-sans-bold text-outline tracking-widest uppercase text-center mt-6">
        Kickstand App v4.2.0
      </Text>
    </SafeScreen>
  );
}
