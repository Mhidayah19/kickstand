import { router } from 'expo-router';
import React from 'react';
import { BikeForm } from '../../../components/bike/bike-form';
import { SafeScreen } from '../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../components/ui/screen-header';
import { useCreateBike } from '../../../lib/api/use-bikes';
import { useBikeStore } from '../../../lib/store/bike-store';
import type { BikeFormValues } from '../../../lib/validation/bike-schema';

export default function AddBikeScreen() {
  const createBike = useCreateBike();
  const setActiveBikeId = useBikeStore((s) => s.setActiveBikeId);

  const handleSubmit = async (values: BikeFormValues) => {
    const bike = await createBike.mutateAsync({
      model: values.model,
      year: values.year,
      plateNumber: values.plateNumber,
      class: values.class,
      currentMileage: values.currentMileage,
      ...(values.coeExpiry && { coeExpiry: values.coeExpiry }),
      ...(values.roadTaxExpiry && { roadTaxExpiry: values.roadTaxExpiry }),
      ...(values.insuranceExpiry && { insuranceExpiry: values.insuranceExpiry }),
      ...(values.inspectionDue && { inspectionDue: values.inspectionDue }),
    });
    setActiveBikeId(bike.id);
    router.back();
  };

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Add Bike" />
      <BikeForm onSubmit={handleSubmit} submitLabel="Add Bike" />
    </SafeScreen>
  );
}
