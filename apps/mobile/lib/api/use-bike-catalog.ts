import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { BikeCatalogEntry } from '../types/bike';

export function useBikeCatalogMakes() {
  return useQuery({
    queryKey: ['bike-catalog', 'makes'],
    queryFn: () => apiClient.get<string[]>('/bike-catalog/makes'),
    staleTime: 1000 * 60 * 60, // 1 hour — catalog data rarely changes
  });
}

export function useBikeCatalogModels(make: string | null) {
  return useQuery({
    queryKey: ['bike-catalog', 'models', make],
    queryFn: () => apiClient.get<BikeCatalogEntry[]>(`/bike-catalog/models?make=${encodeURIComponent(make!)}`),
    enabled: !!make,
    staleTime: 1000 * 60 * 60,
  });
}
