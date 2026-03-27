import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ServiceLogFormBody } from '../../../components/service/service-log-form-body';
import { useBike } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { useServiceLogForm } from '../../../lib/hooks/use-service-log-form';

export default function AddServiceScreen() {
  const router = useRouter();
  const activeBikeId = useBikeStore((s) => s.activeBikeId);
  const { data: bike } = useBike(activeBikeId);
  const form = useServiceLogForm(activeBikeId);

  const bikeLabel = bike
    ? `${bike.make ?? ''} ${bike.model ?? ''}`.trim() + (bike.plateNumber ? ` • ${bike.plateNumber}` : '')
    : 'Loading...';

  const handleSave = async () => {
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
  };

  return <ServiceLogFormBody form={form} bikeLabel={bikeLabel} onSave={handleSave} />;
}
