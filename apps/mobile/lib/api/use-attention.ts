import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { AttentionResponse } from '../types/attention';

export const attentionKeys = {
  all: ['attention'] as const,
  byBike: (bikeId: string) => [...attentionKeys.all, bikeId] as const,
};

export function useAttention(bikeId: string | null) {
  return useQuery({
    queryKey: bikeId ? attentionKeys.byBike(bikeId) : attentionKeys.all,
    queryFn: () =>
      apiClient.get<AttentionResponse>(`/bikes/${bikeId}/attention`),
    enabled: !!bikeId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}
