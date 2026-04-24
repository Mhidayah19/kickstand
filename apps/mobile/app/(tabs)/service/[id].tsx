import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ConfirmationDialog } from '../../../components/ui/confirmation-dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { ReceiptStrip } from '../../../components/service/ReceiptStrip';
import { ReceiptViewer } from '../../../components/service/ReceiptViewer';
import * as Haptics from 'expo-haptics';
import { useServiceLog, useDeleteServiceLog, useUpdateServiceLog } from '../../../lib/api/use-service-logs';
import { useImageUpload } from '../../../lib/hooks/use-image-upload';
import { useBikeStore } from '../../../lib/store/bike-store';
import { colors } from '../../../lib/colors';
import { SERVICE_TYPE_LABELS } from '../../../lib/constants/service-types';
import type { ServiceTypeKey } from '../../../lib/constants/service-types';
import { Icon, Eyebrow } from '../../../components/ui/atelier';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCost(cost: string): string {
  const num = parseFloat(cost);
  return isNaN(num) ? 'S$0' : `S$${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
}

function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString('en-SG')} km`;
}

function BackBtn() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={12} className="w-9 h-9 items-center justify-center">
      <View style={{ transform: [{ rotate: '180deg' }] }}>
        <Icon name="chevron" size={18} stroke={colors.ink} />
      </View>
    </Pressable>
  );
}

const Divider = () => <View className="h-px bg-hairline mx-5" />;

export default function ServiceDetailScreen() {
  const { id, bikeId: bikeIdParam } = useLocalSearchParams<{ id: string; bikeId?: string }>();
  const router = useRouter();
  const { activeBikeId } = useBikeStore();
  const bikeId = bikeIdParam ?? activeBikeId;
  const { data: log, isLoading } = useServiceLog(bikeId, id ?? null);
  const deleteLog = useDeleteServiceLog(bikeId);
  const updateLog = useUpdateServiceLog(bikeId);
  const { uploadingCount, pickAndUploadMultiple } = useImageUpload({
    bucket: 'receipts',
    prefix: id ?? '',
    dialogTitle: 'Add Receipt',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);

  const handleEdit = useCallback(() => {
    if (!id || !bikeId) return;
    router.push(`/edit-service?logId=${id}&bikeId=${bikeId}`);
  }, [id, bikeId, router]);

  const handleConfirmDelete = useCallback(() => {
    if (!id) return;
    deleteLog.mutate(id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        router.back();
      },
      onError: () => {
        setShowDeleteDialog(false);
        Alert.alert('Error', 'Failed to delete service log.');
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
        onError: () => Alert.alert('Error', 'Failed to save receipt.'),
      },
    );
  }, [log, id, pickAndUploadMultiple, updateLog]);

  const handleRemove = useCallback((index: number) => {
    if (!log) return;
    const updated = log.receiptUrls.filter((_, i) => i !== index);
    updateLog.mutate(
      { logId: id!, input: { receiptUrls: updated } },
      { onError: () => Alert.alert('Error', 'Failed to remove receipt.') },
    );
  }, [log, id, updateLog]);

  const handlePress = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-5 pt-4 pb-2 flex-row items-center">
          <BackBtn />
        </View>
        <View className="px-5 pt-4">
          <Skeleton height={10} className="w-20 rounded mb-4" />
          <Skeleton height={40} className="w-56 rounded mb-8" />
          <Skeleton height={1} className="w-full rounded mb-4" />
          <Skeleton height={60} className="w-full rounded mb-4" />
          <Skeleton height={1} className="w-full rounded mb-4" />
          <Skeleton height={40} className="w-full rounded mb-4" />
        </View>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView className="flex-1 bg-bg">
        <View className="px-5 pt-4 pb-2 flex-row items-center">
          <BackBtn />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-display text-[28px] leading-[32px] tracking-[-0.025em] text-ink mb-2">
            Not found
          </Text>
          <Text className="font-sans text-sm text-muted text-center">
            This service log may have been deleted.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const key = log.serviceType as ServiceTypeKey;
  const serviceLabel = SERVICE_TYPE_LABELS[key] ?? log.serviceType;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Top bar */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <BackBtn />
        <Eyebrow>Service Log</Eyebrow>
        <Pressable
          onPress={handleEdit}
          hitSlop={8}
          className="active:opacity-60 px-1 py-1"
        >
          <Text className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink">Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 64 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — service type name */}
        <View className="px-5 pt-4 pb-6">
          <Eyebrow className="mb-3">Service Type</Eyebrow>
          <Text
            className="font-display text-ink leading-[1.02] tracking-[-0.035em]"
            style={{ fontSize: 40 }}
          >
            {serviceLabel}
          </Text>
        </View>

        <View className="h-px bg-hairline" />

        {/* Date + Cost */}
        <View className="flex-row px-5 py-5">
          <View className="flex-1">
            <Eyebrow className="mb-2">Date</Eyebrow>
            <Text className="font-sans-semibold text-[14px] text-ink">{formatDate(log.date)}</Text>
          </View>
          <View className="flex-1">
            <Eyebrow className="mb-2">Cost</Eyebrow>
            <Text
              className="font-display text-ink tracking-[-0.025em]"
              style={{ fontSize: 28, lineHeight: 34 }}
            >
              {formatCost(log.cost)}
            </Text>
          </View>
        </View>

        <Divider />

        {/* Mileage */}
        <View className="px-5 py-5">
          <Eyebrow className="mb-2">Mileage</Eyebrow>
          <Text className="font-sans-semibold text-[14px] text-ink">{formatMileage(log.mileageAt)}</Text>
        </View>

        {/* Workshop */}
        {!!log.workshop && (
          <>
            <Divider />
            <View className="px-5 py-5">
              <Eyebrow className="mb-2">Workshop</Eyebrow>
              <Text className="font-sans-semibold text-[14px] text-ink" numberOfLines={1}>
                {log.workshop.name}
              </Text>
              {!!log.workshop.address && (
                <Text className="font-sans text-[13px] text-muted mt-1" numberOfLines={2}>
                  {log.workshop.address}
                </Text>
              )}
            </View>
          </>
        )}

        {/* Notes */}
        {!!log.description && (
          <>
            <Divider />
            <View className="px-5 py-5">
              <Eyebrow className="mb-3">Notes</Eyebrow>
              <Text className="font-sans text-[14px] leading-[22px] text-ink">
                {log.description}
              </Text>
            </View>
          </>
        )}

        {/* Parts */}
        {log.parts && log.parts.length > 0 && (
          <>
            <Divider />
            <View className="px-5 py-5">
              <Eyebrow className="mb-3">Parts replaced</Eyebrow>
              {log.parts.map((part, i) => (
                <View key={`${i}-${part}`} className="flex-row items-center py-2">
                  <View className="w-1 h-1 rounded-full bg-muted mr-3" />
                  <Text className="font-sans text-[14px] text-ink">{part}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Receipts */}
        <Divider />
        <View className="px-5 py-5">
          <Eyebrow className="mb-3">Receipts</Eyebrow>
          <ReceiptStrip
            urls={log.receiptUrls}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onPress={handlePress}
            uploadingCount={uploadingCount}
            removable={false}
          />
        </View>

        {/* Delete */}
        <View className="h-px bg-hairline mt-4" />
        <Pressable
          onPress={() => setShowDeleteDialog(true)}
          className="px-5 py-5 active:opacity-60"
          hitSlop={8}
        >
          <Text className="font-sans text-[14px] text-danger">Delete this log</Text>
        </Pressable>
      </ScrollView>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete log?"
        body={`This ${serviceLabel} record will be permanently removed.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <ReceiptViewer
        urls={log.receiptUrls}
        initialIndex={viewerIndex}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
