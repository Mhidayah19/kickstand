// apps/mobile/app/(tabs)/service/[id].tsx
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { useServiceLog, useDeleteServiceLog } from '../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../lib/store/bike-store';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../../lib/constants/service-types';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Unknown date';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatCost(cost: string): string {
  const num = parseFloat(cost);
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
}

function formatMileage(mileage: number): string {
  return mileage.toLocaleString('en-US') + ' km';
}

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeBikeId } = useBikeStore();
  const { data: log, isLoading } = useServiceLog(activeBikeId, id ?? null);
  const deleteLog = useDeleteServiceLog(activeBikeId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEdit = useCallback(() => {
    if (!id || !activeBikeId) return;
    router.push(`/edit-service?logId=${id}&bikeId=${activeBikeId}`);
  }, [id, activeBikeId, router]);

  const handleConfirmDelete = useCallback(() => {
    if (!id) return;
    deleteLog.mutate(id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.back();
      },
      onError: () => {
        setShowDeleteDialog(false);
        Alert.alert('Error', 'Failed to delete service log. Please try again.');
      },
    });
  }, [id, deleteLog, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6 pt-4 flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
          </TouchableOpacity>
        </View>
        <View className="px-6">
          <Skeleton height={12} className="w-24 rounded-md mb-3" />
          <Skeleton height={32} className="w-56 rounded-md mb-2" />
          <Skeleton height={32} className="w-40 rounded-md mb-8" />
          <Skeleton height={16} className="w-full rounded-md mb-3" />
          <Skeleton height={16} className="w-3/4 rounded-md mb-8" />
          <Skeleton height={80} className="w-full rounded-2xl mb-4" />
          <Skeleton height={60} className="w-full rounded-2xl" />
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6 pt-4 mb-6">
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-sans-xbold text-xl text-charcoal mb-2">Log not found</Text>
          <Text className="font-sans-medium text-sm text-sand text-center">
            This service log may have been deleted.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const key = log.serviceType as ServiceTypeKey;
  const serviceLabel = SERVICE_TYPE_LABELS[key] ?? log.serviceType;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Top bar */}
      <View className="px-6 pt-4 flex-row items-center justify-between mb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-row items-center gap-1 bg-yellow px-4 py-2 rounded-full active:opacity-70"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="pencil-outline" size={14} color={colors.charcoal} />
          <Text className="font-sans-bold text-xs text-charcoal">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Service type label + hero title */}
        <View className="mb-6">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">
            Service Type
          </Text>
          <Text className="font-sans-xbold text-charcoal" style={{ fontSize: 28, lineHeight: 34 }}>
            {serviceLabel}
          </Text>
        </View>

        {/* Date + Cost row */}
        <View className="flex-row gap-8 mb-4">
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Date</Text>
            <Text className="font-sans-bold text-sm text-charcoal">{formatFullDate(log.date)}</Text>
          </View>
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Cost</Text>
            <Text className="font-sans-bold text-sm text-charcoal">{formatCost(log.cost)}</Text>
          </View>
        </View>

        {/* Mileage + Workshop row */}
        <View className="flex-row gap-8 mb-6">
          <View>
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Mileage</Text>
            <Text className="font-sans-bold text-sm text-charcoal">{formatMileage(log.mileageAt)}</Text>
          </View>
          {log.workshopId && (
            <View>
              <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Workshop</Text>
              <Text className="font-sans-bold text-sm text-charcoal">{log.workshopId}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {!!log.description && (
          <View className="bg-surface-low rounded-2xl p-4 mb-6">
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-2">
              Description / Notes
            </Text>
            <Text className="font-sans-medium text-sm text-charcoal leading-relaxed">
              {log.description}
            </Text>
          </View>
        )}

        {/* Parts replaced */}
        {log.parts && log.parts.length > 0 && (
          <View className="mb-6">
            <Text className="font-sans-xbold text-base text-charcoal mb-3">Parts Replaced</Text>
            <View className="flex-row flex-wrap gap-2">
              {log.parts.map((part, index) => (
                <View key={`${index}-${part}`} className="bg-surface-low px-3 py-2 rounded-full">
                  <Text className="font-sans-bold text-xs text-charcoal">{part}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Receipt placeholder */}
        <View className="border-2 border-dashed border-sand/30 rounded-2xl p-6 items-center mb-8">
          <MaterialCommunityIcons name="paperclip" size={24} color={colors.sand} />
          <Text className="font-sans-bold text-xs text-sand mt-2">No receipt attached</Text>
        </View>

        {/* Delete */}
        <TouchableOpacity
          onPress={() => setShowDeleteDialog(true)}
          className="items-center active:opacity-70"
          hitSlop={8}
        >
          <Text className="font-sans-bold text-sm text-danger">Delete this log</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Service Log"
        body={`Are you sure you want to delete this ${serviceLabel} log?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}
