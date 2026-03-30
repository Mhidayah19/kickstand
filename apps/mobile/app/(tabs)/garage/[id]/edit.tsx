import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { BikeForm } from '../../../../components/bike/bike-form';
import { SafeScreen } from '../../../../components/ui/safe-screen';
import { ScreenHeader } from '../../../../components/ui/screen-header';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useBike, useUpdateBike } from '../../../../lib/api/use-bikes';
import type { BikeFormValues } from '../../../../lib/validation/bike-schema';

export default function EditBikeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: bike, isLoading } = useBike(id);
  const updateBike = useUpdateBike(id ?? '');

  const handleSubmit = async (values: BikeFormValues) => {
    await updateBike.mutateAsync({
      model: values.model,
      year: values.year,
      plateNumber: values.plateNumber,
      class: values.class,
      coeExpiry: values.coeExpiry || undefined,
      roadTaxExpiry: values.roadTaxExpiry || undefined,
      insuranceExpiry: values.insuranceExpiry || undefined,
      inspectionDue: values.inspectionDue || undefined,
    });
    router.back();
  };

  if (isLoading || !bike) {
    return (
      <SafeScreen scrollable>
        <Skeleton height={32} className="rounded-md mb-lg w-48" />
        <Skeleton height={48} className="rounded-lg mb-md" />
        <Skeleton height={48} className="rounded-lg mb-md" />
        <Skeleton height={48} className="rounded-lg mb-md" />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable>
      <ScreenHeader title="Edit Bike" />
      <BikeForm
        defaultValues={{
          model: bike.model,
          year: bike.year,
          plateNumber: bike.plateNumber,
          class: bike.class,
          currentMileage: bike.currentMileage,
          coeExpiry: bike.coeExpiry ?? '',
          roadTaxExpiry: bike.roadTaxExpiry ?? '',
          insuranceExpiry: bike.insuranceExpiry ?? '',
          inspectionDue: bike.inspectionDue ?? '',
        }}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </SafeScreen>
  );
}
