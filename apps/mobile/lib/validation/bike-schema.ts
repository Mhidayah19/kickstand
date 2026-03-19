import { z } from 'zod';

const currentYear = new Date().getFullYear();
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const bikeSchema = z.object({
  model: z.string().min(2, 'Model must be at least 2 characters'),
  year: z.number().int().min(1990, 'Year must be 1990 or later').max(currentYear + 1, `Year must be ${currentYear + 1} or earlier`),
  plateNumber: z.string().min(3, 'Plate number must be at least 3 characters'),
  class: z.enum(['2B', '2A', '2'], { errorMap: () => ({ message: 'Select a valid class' }) }),
  currentMileage: z.number().min(0, 'Mileage cannot be negative'),
  coeExpiry: z.string().regex(DATE_REGEX, 'Enter a valid date (YYYY-MM-DD)').optional().or(z.literal('')),
  roadTaxExpiry: z.string().regex(DATE_REGEX, 'Enter a valid date (YYYY-MM-DD)').optional().or(z.literal('')),
  insuranceExpiry: z.string().regex(DATE_REGEX, 'Enter a valid date (YYYY-MM-DD)').optional().or(z.literal('')),
  inspectionDue: z.string().regex(DATE_REGEX, 'Enter a valid date (YYYY-MM-DD)').optional().or(z.literal('')),
});

export const updateMileageSchema = z.object({
  mileage: z.number().min(0, 'Mileage cannot be negative'),
});

export type BikeFormValues = z.infer<typeof bikeSchema>;
export type UpdateMileageFormValues = z.infer<typeof updateMileageSchema>;
