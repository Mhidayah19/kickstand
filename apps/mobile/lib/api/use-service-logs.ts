import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse } from '../types/api';
import type { ServiceLog } from '../types/service-log';

export const serviceLogsKeys = {
  all: ['service-logs'] as const,
  byBike: (bikeId: string) => [...serviceLogsKeys.all, bikeId] as const,
  list: (bikeId: string, limit?: number) =>
    [...serviceLogsKeys.byBike(bikeId), { limit }] as const,
  detail: (bikeId: string, logId: string) =>
    [...serviceLogsKeys.byBike(bikeId), logId] as const,
};

export interface CreateServiceLogInput {
  serviceType: string;
  description: string;
  parts?: string[];
  cost: string;
  mileageAt: number;
  date: string;
  workshopId?: string;
  receiptUrl?: string;
}

export interface UpdateServiceLogInput {
  serviceType?: string;
  description?: string;
  parts?: string[];
  cost?: string;
  mileageAt?: number;
  date?: string;
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

export function useServiceLog(bikeId: string | null, logId: string | null) {
  return useQuery({
    queryKey: serviceLogsKeys.detail(bikeId ?? '', logId ?? ''),
    queryFn: () =>
      apiClient.get<ServiceLog>(`/bikes/${bikeId}/services/${logId}`),
    enabled: !!bikeId && !!logId,
  });
}

export function useCreateServiceLog(bikeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceLogInput) =>
      apiClient.post<ServiceLog>(`/bikes/${bikeId}/services`, input),
    onSuccess: () => {
      if (!bikeId) return;
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.byBike(bikeId) });
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.all });
    },
  });
}

export function useUpdateServiceLog(bikeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ logId, input }: { logId: string; input: UpdateServiceLogInput }) =>
      apiClient.patch<ServiceLog>(`/bikes/${bikeId}/services/${logId}`, input),
    onSuccess: (data, { logId }) => {
      if (!bikeId) return;
      queryClient.setQueryData(serviceLogsKeys.detail(bikeId, logId), data);
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.byBike(bikeId) });
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.all });
    },
  });
}

export function useDeleteServiceLog(bikeId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      apiClient.delete<void>(`/bikes/${bikeId}/services/${logId}`),
    onSuccess: () => {
      if (!bikeId) return;
      queryClient.invalidateQueries({ queryKey: serviceLogsKeys.byBike(bikeId) });
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
