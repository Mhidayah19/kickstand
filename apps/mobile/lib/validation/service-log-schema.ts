import { z } from 'zod/v3';
import { SERVICE_TYPE_KEYS } from '../constants/service-types';

export const serviceLogSchema = z.object({
  serviceTypeKey: z.enum(SERVICE_TYPE_KEYS as unknown as [string, ...string[]]),
  mileage: z.string().min(1, 'Mileage is required').refine(
    (val) => {
      const num = parseInt(val.replace(/,/g, ''), 10);
      return !isNaN(num) && num >= 0;
    },
    { message: 'Enter a valid mileage' },
  ),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is required'),
  cost: z.string().min(1, 'Cost is required'),
});

export type ServiceLogFormValues = z.infer<typeof serviceLogSchema>;
