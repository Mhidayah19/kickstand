import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse } from '../types/api';
import type { ServiceLog } from '../types/service-log';

// Query key factory for proper cache invalidation
export const serviceLogsKeys = {
  all: ['service-logs'] as const,
  byBike: (bikeId: string) => [...serviceLogsKeys.all, bikeId] as const,
  list: (bikeId: string, limit?: number) =>
    [...serviceLogsKeys.byBike(bikeId), { limit }] as const,
};

export interface CreateServiceLogInput {
  serviceType: string;
  description: string;
  cost: string;
  mileageAt: number;
  date: string;
  workshopId?: string;
  receiptUrl?: string;
}

/**
 * Fetch service logs for a bike.
 * Omit limit to use the API's default pagination.
 * Pass limit=3 for the Home screen's recent-services widget.
 */
export function useServiceLogs(bikeId: string | null, limit?: number) {
  const queryParams = limit ? `?limit=${limit}` : '';
  return useQuery({
    queryKey: serviceLogsKeys.list(bikeId ?? '', limit),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceLog>>(
        `/bikes/${bikeId}/services${queryParams}`,
      ),
    enabled: !!bikeId,
  });
}

export function useCreateServiceLog(bikeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceLogInput) => {
      if (!bikeId) throw new Error('No bike selected');
      return apiClient.post<ServiceLog>(`/bikes/${bikeId}/services`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.byBike(bikeId!) });
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.all });
    },
  });
}

export function useAllServiceLogs(limit = 50) {
  return useQuery({
    queryKey: [...serviceLogsKeys.all, 'cross-bike', { limit }],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceLog>>(
        `/service-logs?limit=${limit}`,
      ),
  });
}
