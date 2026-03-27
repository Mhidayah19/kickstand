import React from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ServiceLogFormBody } from '../../../../components/service/service-log-form-body';
import { useBike } from '../../../../lib/api/use-bikes';
import { useServiceLogForm } from '../../../../lib/hooks/use-service-log-form';

export default function ServiceLogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike } = useBike(id);
  const form = useServiceLogForm(id ?? null);

  const bikeLabel = bike
    ? `${bike.make ?? ''} ${bike.model ?? ''}`.trim() + (bike.plateNumber ? ` • ${bike.plateNumber}` : '')
    : 'Loading...';

  const handleSave = async () => {
    try {
      await form.handleSave();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save service log.';
      Alert.alert('Error', message);
    }
  };

  return <ServiceLogFormBody form={form} bikeLabel={bikeLabel} onSave={handleSave} />;
}
