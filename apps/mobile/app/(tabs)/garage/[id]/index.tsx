import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../../lib/colors';
import { daysUntil } from '../../../../lib/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConfirmationDialog } from '../../../../components/ui/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { ListCard } from '../../../../components/ui/list-card';
import { Section } from '../../../../components/ui/section';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useDeleteBike, useBike } from '../../../../lib/api/use-bikes';
import { useServiceLogs } from '../../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../../lib/store/bike-store';
import { serviceTypeToMeta } from '../../../../lib/service-type-meta';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CLASS_LABELS: Record<string, string> = {
  '2B': 'Class 2B',
  '2A': 'Class 2A',
  '2': 'Class 2',
};

function formatComplianceDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()].toUpperCase()} ${d.getFullYear()}`;
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-xxs font-sans-bold text-sand uppercase tracking-widest mb-1">
        {label}
      </Text>
      <Text className="text-base font-sans-xbold text-charcoal">{value}</Text>
    </View>
  );
}

function formatLogDate(dateStr: string): string {
  const [, monthStr, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(monthStr) - 1]}`;
}

export default function BikeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const deleteBike = useDeleteBike(id ?? '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const insets = useSafeAreaInsets();
  const contentInsets = useMemo(
    () => ({ top: insets.top, bottom: insets.bottom, left: 4, right: 4 }),
    [insets.top, insets.bottom]
  );
  const { data: logsData } = useServiceLogs(id, 3);
  const logs = logsData?.data ?? [];
  const { setActiveBikeId } = useBikeStore();

  const handleDelete = async () => {
    await deleteBike.mutateAsync();
    setShowDeleteDialog(false);
    router.replace('/(tabs)/garage');
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

  const complianceItems = [
    { icon: 'calendar-month-outline', label: 'COE Expiry', date: bike.coeExpiry },
    { icon: 'file-document-outline', label: 'Road Tax Expiry', date: bike.roadTaxExpiry },
    { icon: 'shield-outline', label: 'Insurance Expiry', date: bike.insuranceExpiry },
    { icon: 'clipboard-check-outline', label: 'Inspection Due', date: bike.inspectionDue },
  ].filter((item): item is typeof item & { date: string } => !!item.date);

  return (
    <SafeAreaView className="flex-1 bg-surface">
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
            <DropdownMenuItem onPress={() => router.push(`/(tabs)/garage/${id}/edit`)}>
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View
          className="mx-4 rounded-3xl overflow-hidden"
          style={{ height: 320, marginTop: insets.top + 56 }}
        >
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

        {/* Bike Specs */}
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

        {/* Compliance & Renewals */}
        {complianceItems.length > 0 && (
          <View className="px-6">
            <Section label="Compliance & Renewals">
              <View className="bg-surface-low rounded-3xl p-2 gap-2">
                {complianceItems.map((item) => (
                  <View key={item.label} className="bg-surface-card rounded-2xl p-5 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <MaterialCommunityIcons name={item.icon as any} size={22} color={colors.sand} />
                      <Text className="font-sans-bold text-sm text-charcoal">{item.label}</Text>
                    </View>
                    <Text className={`text-sm font-sans-bold ${(daysUntil(item.date) ?? 1) <= 0 ? 'text-danger' : 'text-charcoal'}`}>
                      {formatComplianceDate(item.date)}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          </View>
        )}

        {/* Service History */}
        <View className="px-6 mt-2">
          <Section
            label="Service History"
            action="View All"
            onAction={() => router.push('/(tabs)/log')}
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
              <Pressable onPress={() => {
                setActiveBikeId(id);
                router.push('/add-service');
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
