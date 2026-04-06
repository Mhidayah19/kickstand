import React, { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ServiceLogFormBody } from '../components/service/service-log-form-body';
import { ModalFormScreen } from '../components/ui/modal-form-screen';
import { useBike } from '../lib/api/use-bikes';
import { useAllServiceLogs } from '../lib/api/use-service-logs';
import { useBikeStore } from '../lib/store/bike-store';
import { useServiceLogForm } from '../lib/hooks/use-service-log-form';
import { formatBikeLabel } from '../lib/format-bike-label';
import { getFrequentServiceTypes } from '../lib/service-type-helpers';

export default function AddServiceScreen() {
  const router = useRouter();
  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  const { data: allLogs } = useAllServiceLogs();
  const form = useServiceLogForm(activeBikeId, bike?.currentMileage);

  const frequentTypes = useMemo(
    () => getFrequentServiceTypes(allLogs?.data ?? [], 3),
    [allLogs?.data],
  );

  const bikeLabel = bike ? formatBikeLabel(bike) : activeBikeId ? 'Loading...' : 'Select a bike';

  const handleSave = useCallback(async () => {
    if (!activeBikeId) {
      Alert.alert('No bike selected', 'Please select a bike in your garage first.');
      return;
    }
    try {
      await form.handleSave();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save service log.';
      Alert.alert('Error', message);
    }
  }, [activeBikeId, form.handleSave, router]);

  const handleClose = useCallback(() => {
    form.handleReset();
    router.back();
  }, [form.handleReset, router]);

  const cta = useMemo(() => form.serviceTypeKey ? {
    label: form.isPending ? 'Saving...' : 'Save Log',
    icon: 'check-circle',
    onPress: handleSave,
    disabled: form.isPending,
  } : undefined, [form.serviceTypeKey, form.isPending, handleSave]);

  return (
    <ModalFormScreen
      onClose={handleClose}
      title="New Service Log"
      subtitle={bikeLabel}
      cta={cta}
    >
      <ServiceLogFormBody
        form={form}
        frequentTypes={frequentTypes}
        bikeId={activeBikeId ?? ''}
      />
    </ModalFormScreen>
  );
}
