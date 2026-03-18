import { z } from 'zod';

const currentYear = new Date().getFullYear();

const isoDateOrEmpty = z.string().refine(
  (val) => val === '' || /^\d{4}-\d{2}-\d{2}$/.test(val),
  { message: 'Date must be in YYYY-MM-DD format' }
).optional();

export const bikeSchema = z.object({
  model: z.string().min(2, 'Model must be at least 2 characters'),
  year: z.number().int().min(1990, 'Year must be 1990 or later').max(currentYear + 1, 'Year is too far in the future'),
  plateNumber: z.string().min(3, 'Plate number must be at least 3 characters'),
  class: z.enum(['2B', '2A', '2']),
  currentMileage: z.number().min(0, 'Mileage must be 0 or greater'),
  coeExpiry: isoDateOrEmpty,
  roadTaxExpiry: isoDateOrEmpty,
  insuranceExpiry: isoDateOrEmpty,
  inspectionDue: isoDateOrEmpty,
});

export const updateMileageSchema = z.object({
  mileage: z.number().min(0, 'Mileage must be 0 or greater'),
});

export type BikeFormValues = z.infer<typeof bikeSchema>;
export type UpdateMileageFormValues = z.infer<typeof updateMileageSchema>;
