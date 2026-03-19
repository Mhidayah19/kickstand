import React from 'react';
import { EmptyState } from '../../../../components/ui/empty-state';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';

export default function BikeServicesScreen() {
  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Service History" />
      <EmptyState
        title="No services logged"
        description="Tap + to log your first service"
      />
    </SafeScreen>
  );
}
