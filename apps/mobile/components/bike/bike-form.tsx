import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { DateField } from '../ui/date-field';
import { FormField } from '../ui/form-field';
import { Section } from '../ui/section';
import { SelectField } from '../ui/select-field';
import { TextField } from '../ui/text-field';
import { type BikeFormValues, bikeSchema } from '../../lib/validation/bike-schema';

const CLASS_OPTIONS = [
  { label: '2B', value: '2B' },
  { label: '2A', value: '2A' },
  { label: '2', value: '2' },
];

interface BikeFormProps {
  defaultValues?: Partial<BikeFormValues>;
  onSubmit: (values: BikeFormValues) => Promise<void> | void;
  submitLabel?: string;
}

export function BikeForm({ defaultValues, onSubmit, submitLabel = 'Save' }: BikeFormProps) {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<BikeFormValues>({
    resolver: zodResolver(bikeSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      class: '2A',
      currentMileage: 0,
      coeExpiry: '',
      roadTaxExpiry: '',
      insuranceExpiry: '',
      inspectionDue: '',
      ...defaultValues,
    },
  });

  return (
    <View>
      <Section label="Bike Info">
        <FormField control={control} name="model" errors={errors}>
          <TextField label="Model" placeholder="Honda CB400X" />
        </FormField>
        <FormField control={control} name="year" errors={errors}>
          <TextField
            label="Year"
            placeholder="2022"
            keyboardType="number-pad"
          />
        </FormField>
        <FormField control={control} name="plateNumber" errors={errors}>
          <TextField
            label="Plate Number"
            placeholder="FBR1234A"
            autoCapitalize="characters"
          />
        </FormField>
        <FormField control={control} name="class" errors={errors}>
          <SelectField label="Class" options={CLASS_OPTIONS} />
        </FormField>
        <FormField control={control} name="currentMileage" errors={errors}>
          <TextField
            label="Current Mileage (km)"
            placeholder="15000"
            keyboardType="number-pad"
          />
        </FormField>
      </Section>

      <Section label="Compliance Dates (optional)">
        <FormField control={control} name="coeExpiry" errors={errors}>
          <DateField label="COE Expiry" />
        </FormField>
        <FormField control={control} name="roadTaxExpiry" errors={errors}>
          <DateField label="Road Tax Expiry" />
        </FormField>
        <FormField control={control} name="insuranceExpiry" errors={errors}>
          <DateField label="Insurance Expiry" />
        </FormField>
        <FormField control={control} name="inspectionDue" errors={errors}>
          <DateField label="Inspection Due" />
        </FormField>
      </Section>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="bg-charcoal rounded-full py-md items-center mt-sm mb-xl"
        activeOpacity={0.85}
      >
        <Text className="text-base font-sans-bold text-white">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
