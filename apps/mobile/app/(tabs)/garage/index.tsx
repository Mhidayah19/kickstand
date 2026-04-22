import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../lib/colors';
import { daysUntil } from '../../../lib/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EmptyState } from '../../../components/ui/empty-state';
import { ListCard } from '../../../components/ui/list-card';
import { Section } from '../../../components/ui/section';
import { Skeleton } from '../../../components/ui/skeleton';
import { TopAppBar } from '../../../components/ui/top-app-bar';
import { useDeleteBike, useBike, useBikes } from '../../../lib/api/use-bikes';
import { useAttention } from '../../../lib/api/use-attention';
import { useServiceLogs } from '../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../lib/service-type-meta';
import { formatComplianceDate, formatLogDate } from '../../../lib/format';
import { CLASS_LABELS, SpecItem } from '../../../components/bike/spec-item';

export default function GarageScreen() {
  const { activeBikeId, setActiveBikeId } = useBikeStore();
  const { data: bikes = [], isLoading: bikesLoading } = useBikes();
  const { data: bike, isLoading: bikeLoading } = useBike(activeBikeId);
  const { data: logsData } = useServiceLogs(activeBikeId, 3);
  const { data: attention } = useAttention(activeBikeId);
  const deleteBike = useDeleteBike(activeBikeId ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []));

  const logs = logsData?.data ?? [];
  const bikeList = useMemo(
    () => bikes.map((b) => ({ id: b.id, model: b.model, year: b.year })),
    [bikes]
  );
  const activeBikeMeta = useMemo(
    () => bike ? { id: bike.id, model: bike.model, year: bike.year } : undefined,
    [bike]
  );
  const badgeCount = attention?.summary.needsAttention ?? 0;
  const contentInsets = useMemo(
    () => ({ top: insets.top, bottom: insets.bottom, left: 4, right: 4 }),
    [insets.top, insets.bottom]
  );

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    setShowDeleteDialog(false);
    const remaining = bikes.filter((b) => b.id !== activeBikeId);
    if (remaining.length > 0) setActiveBikeId(remaining[0].id);
  };

  const isLoading = bikesLoading || (!!activeBikeId && bikeLoading);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <TopAppBar
          activeBike={activeBikeMeta}
          bikes={bikeList}
          onBikeChange={setActiveBikeId}
          onNotificationPress={() => router.push('/notifications' as any)}
          onAddBikePress={() => router.push('/add-bike')}
          unreadNotifications={0}
        />
        <ScrollView
          contentContainerStyle={{ paddingTop: 80, paddingBottom: 128 }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton height={280} className="mx-4 rounded-3xl mb-6" />
          <View className="px-6">
            <Skeleton height={24} className="rounded-md mb-2 w-24" />
            <Skeleton height={40} className="rounded-md mb-2 w-48" />
            <Skeleton height={16} className="rounded-md mb-8 w-20" />
            <Skeleton height={160} className="rounded-3xl mb-4" />
            <Skeleton height={200} className="rounded-3xl" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!activeBikeId || !bike) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <TopAppBar
          activeBike={undefined}
          bikes={bikeList}
          onBikeChange={setActiveBikeId}
          onNotificationPress={() => router.push('/notifications' as any)}
          onAddBikePress={() => router.push('/add-bike')}
          unreadNotifications={0}
        />
        <View className="flex-1 px-6" style={{ paddingTop: 80 }}>
          <EmptyState
            title="Your Garage is Empty"
            description="Add your first motorcycle to start tracking maintenance and compliance."
            actionLabel="Add a Motorcycle"
            onAction={() => router.push('/add-bike')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const complianceItems = [
    { icon: 'calendar-month-outline', label: 'COE', date: bike.coeExpiry },
    { icon: 'file-document-outline', label: 'Road Tax', date: bike.roadTaxExpiry },
    { icon: 'shield-outline', label: 'Insurance', date: bike.insuranceExpiry },
    { icon: 'clipboard-check-outline', label: 'Inspection', date: bike.inspectionDue },
  ].filter((item): item is typeof item & { date: string } => !!item.date);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar
        activeBike={activeBikeMeta}
        bikes={bikeList}
        onBikeChange={setActiveBikeId}
        onNotificationPress={() => router.push('/notifications' as any)}
        onAddBikePress={() => router.push('/add-bike')}
        unreadNotifications={badgeCount}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 rounded-3xl overflow-hidden" style={{ height: 280 }}>
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
            colors={['transparent', 'rgba(249,249,249,0.85)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
          />
          <View className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Pressable
                  hitSlop={8}
                  className="w-10 h-10 rounded-full bg-surface-card/80 items-center justify-center active:opacity-70"
                >
                  <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.charcoal} />
                </Pressable>
              </DropdownMenuTrigger>
              <DropdownMenuContent insets={contentInsets} sideOffset={4} align="end">
                <DropdownMenuItem onPress={() => router.push(`/(tabs)/garage/${activeBikeId}/edit`)}>
                  <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.charcoal} />
                  <Text className="text-sm font-sans-bold text-charcoal">Edit Bike</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onPress={() => setShowDeleteDialog(true)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} />
                  <Text className="text-sm font-sans-bold text-danger">Delete Bike</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </View>

        <View className="px-6 mt-6">
          {bike.make && (
            <Text className="font-sans-bold text-xxs uppercase tracking-widest text-sand mb-1">
              {bike.make}
            </Text>
          )}
          <Text className="text-4xl font-sans-xbold text-charcoal">{bike.model}</Text>
        </View>

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

        <View className="px-6 mt-8">
          <Section label="Bike Details">
            <View className="bg-surface-low rounded-3xl p-6">
              <View className="flex-row flex-wrap gap-y-6">
                <View className="w-1/2">
                  <SpecItem label="Plate Number" value={bike.plateNumber} />
                </View>
                <View className="w-1/2">
                  <SpecItem label="Class" value={CLASS_LABELS[bike.class] ?? bike.class} />
                </View>
                {bike.engineCc && (
                  <View className="w-1/2">
                    <SpecItem label="Engine CC" value={`${bike.engineCc}cc`} />
                  </View>
                )}
                {bike.bikeType && (
                  <View className="w-1/2">
                    <SpecItem label="Bike Type" value={bike.bikeType} />
                  </View>
                )}
              </View>
            </View>
          </Section>
        </View>

        {complianceItems.length > 0 && (
          <View className="px-6">
            <Section label="Compliance & Renewals">
              <View className="flex-row flex-wrap gap-3">
                {complianceItems.map((item) => {
                  const days = daysUntil(item.date);
                  const urgent = days !== null && days <= 30;
                  return (
                    <View
                      key={item.label}
                      style={{ width: '48%' }}
                      className={`rounded-2xl p-4 ${urgent ? 'bg-danger/5 border-2 border-danger' : 'bg-surface-card'}`}
                    >
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className={`w-2 h-2 rounded-full ${urgent ? 'bg-danger' : 'bg-sand'}`} />
                        <Text className="font-sans-bold text-xxs uppercase tracking-widest text-charcoal">
                          {item.label}
                        </Text>
                      </View>
                      <Text className="font-sans-medium text-xs text-sand mb-1">
                        {formatComplianceDate(item.date)}
                      </Text>
                      <Text className={`font-sans-bold text-sm ${urgent ? 'text-danger' : 'text-charcoal'}`}>
                        {days === null ? '—' : days <= 0 ? 'Overdue' : `${days} days`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Section>
          </View>
        )}

        <View className="px-6 mt-2">
          <Section
            label="Service History"
            action="View All"
            onAction={() => router.push('/(tabs)/service')}
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
                    />
                  );
                })}
              </View>
            ) : (
              <Pressable
                onPress={() => router.push('/add-service')}
                className="bg-surface-low rounded-2xl p-6 items-center"
              >
                <Text className="font-sans-medium text-sm text-sand text-center mb-2">
                  No service logs yet
                </Text>
                <Text className="font-sans-bold text-xs text-charcoal uppercase tracking-widest">
                  Log First Service →
                </Text>
              </Pressable>
            )}
          </Section>
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
