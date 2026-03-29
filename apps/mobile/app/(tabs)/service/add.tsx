import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ServiceLogFormBody } from '../../../components/service/service-log-form-body';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { useBike } from '../../../lib/api/use-bikes';
import { useAllServiceLogs } from '../../../lib/api/use-service-logs';
import { useBikeStore } from '../../../lib/store/bike-store';
import { useServiceLogForm } from '../../../lib/hooks/use-service-log-form';
import { formatBikeLabel } from '../../../lib/format-bike-label';
import { getFrequentServiceTypes } from '../../../lib/service-type-helpers';

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

  const handleExit = () => {
    form.handleReset();
    router.back();
  };

  return (
    <SafeScreen scrollable showAppBar={false}>
      <ServiceLogFormBody
        form={form}
        bikeLabel={bikeLabel}
        onSave={handleSave}
        onExit={handleExit}
        frequentTypes={frequentTypes}
      />
    </SafeScreen>
  );
}
