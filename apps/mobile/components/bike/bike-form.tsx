import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Section } from '../ui/section';
import { TextField } from '../ui/text-field';
import { SelectField } from '../ui/select-field';
import { DateField } from '../ui/date-field';
import { bikeSchema, BikeFormValues } from '../../lib/validation/bike-schema';

const CLASS_OPTIONS = [
  { label: '2B', value: '2B' },
  { label: '2A', value: '2A' },
  { label: '2', value: '2' },
];

interface BikeFormProps {
  defaultValues?: Partial<BikeFormValues>;
  onSubmit: (values: BikeFormValues) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function BikeForm({ defaultValues, onSubmit, submitLabel = 'Save', isSubmitting = false }: BikeFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<BikeFormValues>({
    resolver: zodResolver(bikeSchema),
    defaultValues: {
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      class: '2B',
      currentMileage: 0,
      ...defaultValues,
    },
  });

  return (
    <View>
      <Section label="Bike">
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
              keyboardType="number-pad"
              onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
              onBlur={onBlur}
              value={value ? String(value) : ''}
              error={errors.year?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="plateNumber"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Plate Number"
              placeholder="FBX1234A"
              autoCapitalize="characters"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.plateNumber?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="class"
          render={({ field: { onChange, value } }) => (
            <SelectField
              label="License Class"
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
              keyboardType="number-pad"
              onChangeText={(v) => onChange(parseInt(v, 10) || 0)}
              onBlur={onBlur}
              value={value ? String(value) : '0'}
              error={errors.currentMileage?.message}
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
        className="bg-hero rounded-full py-md items-center mb-2xl"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text className="text-hero-text font-sans-semibold text-sm">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
