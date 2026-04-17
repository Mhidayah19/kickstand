import { SERVICE_TYPE_KEYS } from '../../common/constants/service-types';

export const OCR_PROMPT = `You are reading a motorcycle workshop receipt for a rider in Singapore.
Extract only the fields below and return them as a JSON object. If a field is not clearly present, return null.
Do not guess mileage — receipts rarely contain it.

Fields:
- date (YYYY-MM-DD) — the service date
- cost — total amount in SGD, decimal string, no currency symbol
- workshopName — business name at the top of the receipt
- parts — array of line items (e.g. "Engine oil 10W-40", "Oil filter"); return [] if none found, never null
- description — one or two sentence summary of the work done
- serviceType — best match from the allowed list, or null if unclear
- confidence — 0-1 overall confidence in the extraction

Allowed serviceType values: ${SERVICE_TYPE_KEYS.join(', ')}`;

export const OCR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    date: { type: 'string', nullable: true },
    cost: { type: 'string', nullable: true },
    workshopName: { type: 'string', nullable: true },
    parts: { type: 'array', items: { type: 'string' } },
    description: { type: 'string', nullable: true },
    serviceType: {
      type: 'string',
      enum: [...SERVICE_TYPE_KEYS, null],
      nullable: true,
    },
    confidence: { type: 'number' },
  },
  required: ['parts', 'confidence'],
};
