import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';
import type { OcrResponse } from '../ocr/types';

export function useOcr() {
  return useMutation({
    mutationFn: (receiptUrl: string) =>
      apiClient.post<OcrResponse>('/service-logs/ocr', { receiptUrl }),
  });
}
