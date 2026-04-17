import type { ServiceTypeKey } from '../constants/service-types';

export interface OcrExtractedFields {
  date: string | null;
  cost: string | null;
  workshopName: string | null;
  parts: string[];
  description: string | null;
  serviceType: ServiceTypeKey | null;
  confidence: number;
}

export interface OcrResponse {
  fields: OcrExtractedFields;
  workshopId: string | null;
  receiptUrl: string;
  cacheHit: boolean;
}
