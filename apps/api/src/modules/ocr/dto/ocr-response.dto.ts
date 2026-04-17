import { SERVICE_TYPE_KEYS } from '../../../common/constants/service-types';

export interface OcrExtractedFields {
  date: string | null; // YYYY-MM-DD
  cost: string | null; // decimal string, no currency symbol
  workshopName: string | null;
  parts: string[];
  description: string | null;
  serviceType: (typeof SERVICE_TYPE_KEYS)[number] | null;
  confidence: number; // 0-1
}

export interface OcrResponse {
  fields: OcrExtractedFields;
  workshopId: string | null; // resolved by server, null if no match
  receiptUrl: string;
  cacheHit: boolean;
}
