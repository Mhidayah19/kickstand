import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { ReceiptStrip } from '../../../components/service/ReceiptStrip';
import { ReceiptViewer } from '../../../components/service/ReceiptViewer';
import * as Haptics from 'expo-haptics';
import { useServiceLog, useDeleteServiceLog, useUpdateServiceLog } from '../../../lib/api/use-service-logs';
import { useImageUpload } from '../../../lib/hooks/use-image-upload';
import { useBikeStore } from '../../../lib/store/bike-store';
import { colors } from '../../../lib/colors';
import {
  SERVICE_TYPE_LABELS,
} from '../../../lib/constants/service-types';
import type { ServiceTypeKey, IconName } from '../../../lib/constants/service-types';

const PART_ICON_RULES: { keywords: string[]; icon: IconName }[] = [
  { keywords: ['spark', 'plug'],                    icon: 'lightning-bolt' },
  { keywords: ['brake', 'fluid', 'dot'],            icon: 'alert-circle' },
  { keywords: ['air', 'filter'],                    icon: 'air-filter' },
  { keywords: ['oil', 'engine oil', 'fork oil'],    icon: 'oil' },
  { keywords: ['chain'],                            icon: 'link-variant' },
  { keywords: ['tire', 'tyre'],                     icon: 'circle-outline' },
  { keywords: ['battery'],                          icon: 'battery' },
  { keywords: ['coolant', 'antifreeze'],            icon: 'thermometer' },
  { keywords: ['clutch'],                           icon: 'cog' },
  { keywords: ['pad', 'brake pad'],                 icon: 'alert-circle' },
];

function getPartIcon(name: string): IconName {
  const lower = name.toLowerCase();
  for (const rule of PART_ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.icon;
  }
  return 'wrench';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
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
  const updateLog = useUpdateServiceLog(activeBikeId);
  const { uploadingCount, pickAndUploadMultiple } = useImageUpload({
    bucket: 'receipts',
    prefix: id ?? '',
    dialogTitle: 'Add Receipt',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

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

  const handleAdd = useCallback(async () => {
    if (!log) return;
    const existing = log.receiptUrls;
    const remaining = 5 - existing.length;
    if (remaining <= 0) return;
    const newUrls = await pickAndUploadMultiple(remaining);
    if (newUrls.length === 0) return;
    updateLog.mutate(
      { logId: id!, input: { receiptUrls: [...existing, ...newUrls] } },
      {
        onSuccess: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        onError: () => Alert.alert('Error', 'Failed to save receipt. Please try again.'),
      },
    );
  }, [log, id, pickAndUploadMultiple, updateLog]);

  const handleRemove = useCallback((index: number) => {
    if (!log) return;
    const updated = (log.receiptUrls).filter((_, i) => i !== index);
    updateLog.mutate(
      { logId: id!, input: { receiptUrls: updated } },
      {
        onError: () => Alert.alert('Error', 'Failed to remove receipt. Please try again.'),
      },
    );
  }, [log, id, updateLog]);

  const handlePress = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

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
  const receiptUrls = log.receiptUrls;

  return (
    <SafeAreaView className="flex-1 bg-surface">
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
        {/* Metadata card */}
        <View className="bg-surface-card rounded-2xl mb-4 overflow-hidden">
          <View className="p-4">
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">
              Service Type
            </Text>
            <Text className="font-sans-xbold text-charcoal" style={{ fontSize: 28, lineHeight: 34 }}>
              {serviceLabel}
            </Text>
          </View>

          <View className="h-px bg-surface-low mx-4" />

          <View className="flex-row p-4">
            <View className="flex-1">
              <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Date</Text>
              <Text className="font-sans-bold text-sm text-charcoal">{formatDate(log.date)}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Cost</Text>
              <Text className="font-sans-xbold text-2xl text-charcoal">{formatCost(log.cost)}</Text>
            </View>
          </View>

          <View className="h-px bg-surface-low mx-4" />

          <View className="p-4">
            <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-1">Mileage</Text>
            <Text className="font-sans-bold text-sm text-charcoal">{formatMileage(log.mileageAt)}</Text>
          </View>

          {!!log.description && (
            <>
              <View className="h-px bg-surface-low mx-4" />
              <View className="p-4">
                <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-2">
                  Description/Notes
                </Text>
                <View className="bg-surface-low rounded-xl p-3">
                  <Text className="font-sans-medium text-sm text-charcoal leading-relaxed">
                    {log.description}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {log.parts && log.parts.length > 0 && (
          <View className="mb-4">
            <Text className="font-sans-xbold text-base text-charcoal mb-3">Parts Replaced</Text>
            <View className="flex-row flex-wrap gap-2">
              {log.parts.map((part, index) => (
                <View key={`${index}-${part}`} className="bg-surface-card px-3 py-2 rounded-full flex-row items-center gap-1.5">
                  <MaterialCommunityIcons name={getPartIcon(part)} size={12} color={colors.charcoal} />
                  <Text className="font-sans-bold text-xs text-charcoal">{part}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="mb-8">
          <Text className="font-sans-bold text-xxs text-sand uppercase tracking-widest mb-3">
            Receipts
          </Text>
          <ReceiptStrip
            urls={receiptUrls}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onPress={handlePress}
            uploadingCount={uploadingCount}
          />
        </View>

        <View className="bg-danger/5 rounded-2xl p-4 mt-4 items-center">
          <TouchableOpacity
            onPress={() => setShowDeleteDialog(true)}
            className="active:opacity-70"
            hitSlop={8}
          >
            <Text className="font-sans-bold text-sm text-danger">Delete this log</Text>
          </TouchableOpacity>
        </View>
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

      <ReceiptViewer
        urls={receiptUrls}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
