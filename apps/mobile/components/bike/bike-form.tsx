import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { DateField } from '../ui/date-field';
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
        <Controller
          control={control}
          name="model"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Model"
              placeholder="Honda CB400X"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.model?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="year"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Year"
              placeholder="2022"
              value={value ? String(value) : ''}
              onChangeText={(text) => onChange(text ? parseInt(text, 10) : 0)}
              onBlur={onBlur}
              error={errors.year?.message}
              keyboardType="number-pad"
            />
          )}
        />
        <Controller
          control={control}
          name="plateNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Plate Number"
              placeholder="FBR1234A"
              value={value}
              onChangeText={(text) => onChange(text.toUpperCase())}
              onBlur={onBlur}
              error={errors.plateNumber?.message}
              autoCapitalize="characters"
            />
          )}
        />
        <Controller
          control={control}
          name="class"
          render={({ field: { onChange, value } }) => (
            <SelectField
              label="Class"
              options={CLASS_OPTIONS}
              value={value}
              onValueChange={onChange}
              error={errors.class?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currentMileage"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Current Mileage (km)"
              placeholder="15000"
              value={value ? String(value) : ''}
              onChangeText={(text) => onChange(text ? parseInt(text, 10) : 0)}
              onBlur={onBlur}
              error={errors.currentMileage?.message}
              keyboardType="number-pad"
            />
          )}
        />
      </Section>

      <Section label="Compliance Dates (optional)">
        <Controller
          control={control}
          name="coeExpiry"
          render={({ field: { onChange, value } }) => (
            <DateField
              label="COE Expiry"
              value={value ?? ''}
              onChange={onChange}
              error={errors.coeExpiry?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="roadTaxExpiry"
          render={({ field: { onChange, value } }) => (
            <DateField
              label="Road Tax Expiry"
              value={value ?? ''}
              onChange={onChange}
              error={errors.roadTaxExpiry?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="insuranceExpiry"
          render={({ field: { onChange, value } }) => (
            <DateField
              label="Insurance Expiry"
              value={value ?? ''}
              onChange={onChange}
              error={errors.insuranceExpiry?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="inspectionDue"
          render={({ field: { onChange, value } }) => (
            <DateField
              label="Inspection Due"
              value={value ?? ''}
              onChange={onChange}
              error={errors.inspectionDue?.message}
            />
          )}
        />
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
