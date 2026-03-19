import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Skeleton } from '../../../../components/ui/skeleton';
import { BikeForm } from '../../../../components/bike/bike-form';
import { useBike, useUpdateBike } from '../../../../lib/api/use-bikes';
import { BikeFormValues } from '../../../../lib/validation/bike-schema';

export default function EditBikeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const { mutate: updateBike, isPending } = useUpdateBike(id);

  const onSubmit = (values: BikeFormValues) => {
    updateBike(values, {
      onSuccess: () => router.back(),
    });
  };

  if (isLoading || !bike) {
    return (
      <SafeScreen scrollable>
        <Skeleton height={32} className="mb-lg" />
        <Skeleton height={300} />
      </SafeScreen>
    );
  }

  const defaultValues: Partial<BikeFormValues> = {
    model: bike.model,
    year: bike.year,
    plateNumber: bike.plateNumber,
    class: bike.class,
    currentMileage: bike.currentMileage,
    coeExpiry: bike.coeExpiry ?? '',
    roadTaxExpiry: bike.roadTaxExpiry ?? '',
    insuranceExpiry: bike.insuranceExpiry ?? '',
    inspectionDue: bike.inspectionDue ?? '',
  };

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Edit Bike" />
      <BikeForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel="Save changes"
      />
    </SafeScreen>
  );
}
