import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BentoStat } from '../../../../components/ui/bento-stat';
import { ConfirmationDialog } from '../../../../components/ui/confirmation-dialog';
import { ListCard } from '../../../../components/ui/list-card';
import { PillBadge } from '../../../../components/ui/pill-badge';
import { PrimaryButton } from '../../../../components/ui/primary-button';
import { ProgressBar } from '../../../../components/ui/progress-bar';
import { Section } from '../../../../components/ui/section';
import { Skeleton } from '../../../../components/ui/skeleton';
import { TopAppBar } from '../../../../components/ui/top-app-bar';
import { useDeleteBike, useBike } from '../../../../lib/api/use-bikes';

export default function BikeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const deleteBike = useDeleteBike(id ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    router.replace('/(tabs)/garage' as any);
  };

  if (isLoading || !bike) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <TopAppBar />
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
      <TopAppBar />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={{ height: 400, width: '100%' }}>
          <View className="flex-1 bg-surface-low items-center justify-center">
            <MaterialCommunityIcons name="motorbike" size={80} color={colors.outline} />
          </View>
          <LinearGradient
            colors={['transparent', colors.surface]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 }}
          />
          <View className="absolute bottom-6 left-6">
            <PillBadge label="Ready to Ride" variant="yellow" />
            <Text className="text-4xl font-sans-xbold text-charcoal mt-2">
              {bike.model}
            </Text>
          </View>
        </View>

        {/* Stats Bento Grid */}
        <View className="px-6 -mt-6">
          <View className="flex-row gap-4 mb-4">
            <BentoStat label="Engine" value="1200cc" accent />
            <BentoStat label="Year" value={String(bike.year ?? '2024')} />
          </View>
          <View className="flex-row gap-4">
            <BentoStat label="Weight" value="205kg" />
            <BentoStat label="Torque" value="110Nm" />
          </View>
        </View>

        {/* Vitals Section */}
        <View className="px-6 mt-8">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-1.5 h-6 bg-charcoal rounded-full" />
            <Text className="font-sans-bold text-xl text-charcoal tracking-tight">
              Vitals
            </Text>
          </View>
          <View className="bg-surface-low p-6 rounded-2xl">
            <ProgressBar
              label="Engine Oil"
              value={85}
              color="yellow"
              statusText="Safe • 85%"
            />
            <View className="mb-6" />
            <ProgressBar
              label="Tire Wear"
              value={40}
              color="sand"
              statusText="Inspect • 40%"
            />
            <View className="mb-6" />
            <ProgressBar
              label="Chain Tension"
              value={12}
              color="danger"
              statusText="Adjust • 12%"
            />
          </View>
        </View>

        {/* Service History */}
        <View className="px-6 mt-8">
          <Section
            label="Service History"
            action="View All"
            onAction={() => router.push(`/(tabs)/garage/${id}/services` as any)}
          >
            <View className="gap-3">
              <ListCard
                icon="oil"
                iconBg="bg-yellow/20"
                iconColor={colors.yellow}
                title="Oil Change"
                subtitle="12 Mar 2026 • 24,500 km"
                onPress={() => {}}
              />
              <ListCard
                icon="link-variant"
                iconBg="bg-sand/20"
                iconColor={colors.sand}
                title="Chain Adjustment"
                subtitle="28 Feb 2026 • 23,800 km"
                onPress={() => {}}
              />
            </View>
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
