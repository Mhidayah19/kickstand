// apps/mobile/app/edit-service.tsx
import React, { useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServiceLogFormBody } from '../components/service/service-log-form-body';
import { ModalFormScreen } from '../components/ui/modal-form-screen';
import { useBike } from '../lib/api/use-bikes';
import { useAllServiceLogs, useServiceLog } from '../lib/api/use-service-logs';
import { useServiceLogForm } from '../lib/hooks/use-service-log-form';
import { formatBikeLabel } from '../lib/format-bike-label';
import { getFrequentServiceTypes } from '../lib/service-type-helpers';
import type { ServiceLog } from '../lib/types/service-log';

interface EditServiceFormProps {
  log: ServiceLog;
  bikeId: string;
  bikeLabel: string;
  frequentTypes: ReturnType<typeof getFrequentServiceTypes>;
  onClose: () => void;
}

function EditServiceForm({ log, bikeId, bikeLabel, frequentTypes, onClose }: EditServiceFormProps) {
  const router = useRouter();
  const form = useServiceLogForm(bikeId, undefined, log);

  const handleSave = useCallback(async () => {
    try {
      await form.handleSave();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save changes.';
      Alert.alert('Error', message);
    }
  }, [form.handleSave, router]);

  const handleClose = useCallback(() => {
    form.handleReset();
    onClose();
  }, [form.handleReset, onClose]);

  const cta = useMemo(() => form.serviceTypeKey ? {
    label: form.isPending ? 'Saving...' : 'Save Changes',
    icon: 'check-circle',
    onPress: handleSave,
    disabled: form.isPending,
  } : undefined, [form.serviceTypeKey, form.isPending, handleSave]);

  return (
    <ModalFormScreen
      onClose={handleClose}
      title="Edit Service Log"
      subtitle={bikeLabel}
      cta={cta}
    >
      <ServiceLogFormBody
        form={form}
        frequentTypes={frequentTypes}
        bikeId={bikeId}
      />
    </ModalFormScreen>
  );
}

export default function EditServiceScreen() {
  const router = useRouter();
  const { logId, bikeId } = useLocalSearchParams<{ logId: string; bikeId: string }>();
  const { data: bike } = useBike(bikeId ?? null);
  const { data: log } = useServiceLog(bikeId ?? null, logId ?? null);
  const { data: allLogs } = useAllServiceLogs();

  const frequentTypes = useMemo(
    () => getFrequentServiceTypes(allLogs?.data ?? [], 3),
    [allLogs?.data],
  );

  const bikeLabel = bike ? formatBikeLabel(bike) : bikeId ? 'Loading...' : 'Unknown bike';

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Don't mount the form until log is available — useForm reads defaultValues once at mount.
  // Rendering null here keeps the modal shell visible while loading.
  if (!log || !bikeId) {
    return null;
  }

  return (
    <EditServiceForm
      log={log}
      bikeId={bikeId}
      bikeLabel={bikeLabel}
      frequentTypes={frequentTypes}
      onClose={handleClose}
    />
  );
}
