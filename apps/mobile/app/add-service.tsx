import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ServiceLogFormBody } from '../components/service/service-log-form-body';
import { ModalFormScreen } from '../components/ui/modal-form-screen';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';
import { useBike } from '../lib/api/use-bikes';
import { useAllServiceLogs } from '../lib/api/use-service-logs';
import { useBikeStore } from '../lib/store/bike-store';
import { useServiceLogForm } from '../lib/hooks/use-service-log-form';
import { formatBikeLabel } from '../lib/format-bike-label';
import { getFrequentServiceTypes } from '../lib/service-type-helpers';
import { SERVICE_TYPE_KEYS, type ServiceTypeKey } from '../lib/constants/service-types';
import { useOcrStore } from '../lib/ocr/ocr-store';

export default function AddServiceScreen() {
  const router = useRouter();
  const { serviceType: serviceTypeParam } = useLocalSearchParams<{ serviceType?: string }>();
  const initialServiceType = SERVICE_TYPE_KEYS.includes(serviceTypeParam as ServiceTypeKey)
    ? (serviceTypeParam as ServiceTypeKey)
    : undefined;
  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  const { data: allLogs } = useAllServiceLogs();
  const form = useServiceLogForm(activeBikeId, bike?.currentMileage, undefined, initialServiceType);
  const pendingOcr = useOcrStore((s) => s.pending);
  const clearOcr = useOcrStore((s) => s.clear);

  useEffect(() => {
    if (pendingOcr) {
      form.prefillFromOcr(pendingOcr);
      clearOcr();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOcr]);

  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

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
    if (form.isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    router.back();
  }, [form.isDirty, router]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
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
    <>
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
          onWorkshopPress={() => router.push('/workshop-search')}
        />
      </ModalFormScreen>

      <ConfirmationDialog
        visible={showDiscardDialog}
        title="Discard Log?"
        body="You have unsaved changes. They will be lost if you close now."
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowDiscardDialog(false)}
      />
    </>
  );
}
