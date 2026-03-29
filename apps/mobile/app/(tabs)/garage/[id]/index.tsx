import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationDialog } from '../../../../components/ui/confirmation-dialog';
import { ListCard } from '../../../../components/ui/list-card';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { Section } from '../../../../components/ui/section';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useDeleteBike, useBike } from '../../../../lib/api/use-bikes';
import { useServiceLogs } from '../../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../../lib/service-type-meta';

function formatLogDate(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, monthStr, day] = dateStr.split('-');
  return `${parseInt(day)} ${months[parseInt(monthStr) - 1]}`;
}

export default function BikeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const deleteBike = useDeleteBike(id ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const insets = useSafeAreaInsets();
  const { data: logsData } = useServiceLogs(id, 3);
  const logs = logsData?.data ?? [];
  const { setActiveBikeId } = useBikeStore();

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    setShowDeleteDialog(false);
    router.replace('/(tabs)/garage' as any);
  };

  if (isLoading || !bike) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 128 }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton height={400} className="mb-4" />
          <View className="px-6">
            <Skeleton height={80} className="rounded-xl mb-4" />
            <Skeleton height={160} className="rounded-2xl mb-4" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Floating nav row — back left, more right */}
      <View
        className="absolute left-0 right-0 z-50 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-surface-card/80 items-center justify-center active:opacity-70"
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.charcoal} />
        </Pressable>
        <Pressable
          onPress={() => setShowDeleteDialog(true)}
          hitSlop={8}
          className="w-10 h-10 rounded-full bg-surface-card/80 items-center justify-center active:opacity-70"
        >
          <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.charcoal} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={{ height: 400, width: '100%' }}>
          {bike.imageUrl ? (
            <Image
              source={{ uri: bike.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 bg-surface-low items-center justify-center">
              <MaterialCommunityIcons name="motorbike" size={80} color={colors.outline} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', '#F9F9F9']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160 }}
          />
        </View>

        {/* Make / Model */}
        <View className="px-6 mt-6">
          {bike.make && (
            <Text className="font-sans-bold text-xxs uppercase tracking-widest text-sand mb-1">
              {bike.make}
            </Text>
          )}
          <Text className="text-4xl font-sans-xbold text-charcoal">
            {bike.model}
          </Text>
        </View>

        {/* Inline stats */}
        <View className="px-6 mt-4 flex-row gap-8">
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest">Year</Text>
            <Text className="font-sans-xbold text-xl text-charcoal">{bike.year}</Text>
          </View>
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest">Mileage</Text>
            <Text className="font-sans-xbold text-xl text-charcoal">
              {bike.currentMileage.toLocaleString()} km
            </Text>
          </View>
        </View>

        {/* Service History */}
        <View className="px-6 mt-8">
          <Section
            label="Service History"
            action="View All"
            onAction={() => router.push('/(tabs)/log' as any)}
          >
            {logs.length > 0 ? (
              <View className="gap-3">
                {logs.map((log) => {
                  const meta = serviceTypeToMeta(log.serviceType);
                  return (
                    <ListCard
                      key={log.id}
                      icon={meta.icon}
                      iconBg={meta.iconBg}
                      iconColor={meta.iconColor}
                      title={meta.label}
                      subtitle={`${formatLogDate(log.date)} • ${log.mileageAt.toLocaleString()} km`}
                      onPress={() => {}}
                    />
                  );
                })}
              </View>
            ) : (
              <Pressable onPress={() => {
                setActiveBikeId(id);
                router.push('/(tabs)/service/add');
              }}>
                <View className="bg-surface-low rounded-2xl p-6 items-center">
                  <Text className="font-sans-medium text-sm text-sand text-center mb-2">
                    No service logs yet
                  </Text>
                  <Text className="font-sans-bold text-xs text-charcoal uppercase tracking-widest">
                    Log First Service →
                  </Text>
                </View>
              </Pressable>
            )}
          </Section>
        </View>

        {/* Start Ride Track */}
        <View className="px-6 mt-4">
          <PrimaryButton
            label="Start Ride Track"
            onPress={() => {}}
            icon="map-marker-path"
          />
        </View>
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title={`Delete ${bike.model}?`}
        body="This will also delete all service history for this bike. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}
