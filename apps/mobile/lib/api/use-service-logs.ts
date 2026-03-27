import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse } from '../types/api';
import type { ServiceLog } from '../types/service-log';

export interface CreateServiceLogInput {
  serviceType: string;
  description: string;
  cost: string;
  mileageAt: number;
  date: string;
  workshopId?: string;
}

const serviceLogsKey = (bikeId: string, limit: number) => ['service-logs', bikeId, { limit }];

export function useServiceLogs(bikeId: string | null, limit = 3) {
  return useQuery({
    queryKey: serviceLogsKey(bikeId ?? '', limit),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceLog>>(
        `/bikes/${bikeId}/services?limit=${limit}`,
      ),
    enabled: !!bikeId,
  });
}

export function useCreateServiceLog(bikeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceLogInput) =>
      apiClient.post<ServiceLog>(`/bikes/${bikeId}/services`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-logs', bikeId] });
      queryClient.invalidateQueries({ queryKey: ['service-logs', 'all'] });
    },
  });
}

export function useAllServiceLogs(limit = 50) {
  return useQuery({
    queryKey: ['service-logs', 'all', { limit }],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ServiceLog>>(
        `/service-logs?limit=${limit}`,
      ),
  });
}
