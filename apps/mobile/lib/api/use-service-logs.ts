import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { PaginatedResponse } from '../types/api';
import type { ServiceLog } from '../types/service-log';

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
