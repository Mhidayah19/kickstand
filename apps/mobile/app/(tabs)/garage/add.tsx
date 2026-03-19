import React from 'react';
import { router } from 'expo-router';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { BikeForm } from '../../../components/bike/bike-form';
import { useCreateBike } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import { BikeFormValues } from '../../../lib/validation/bike-schema';

export default function AddBikeScreen() {
  const { mutate: createBike, isPending } = useCreateBike();
  const setActiveBikeId = useBikeStore((s) => s.setActiveBikeId);

  const onSubmit = (values: BikeFormValues) => {
    createBike(values, {
      onSuccess: (bike) => {
        setActiveBikeId(bike.id);
        router.back();
      },
    });
  };

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Add Bike" />
      <BikeForm
        onSubmit={onSubmit}
        submitLabel="Add bike"
      />
    </SafeScreen>
  );
}
