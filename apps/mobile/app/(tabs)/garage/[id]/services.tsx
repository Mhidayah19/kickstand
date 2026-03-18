import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { EmptyState } from '../../../../components/ui/empty-state';
import { useBike } from '../../../../lib/api/use-bikes';

export default function BikeServicesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike } = useBike(id);

  return (
    <SafeScreen scrollable>
      <ScreenHeader
        title="Service History"
        subtitle={bike?.model ?? ''}
      />
      <EmptyState
        title="No services logged"
        description="Tap + to log your first service"
      />
    </SafeScreen>
  );
}
