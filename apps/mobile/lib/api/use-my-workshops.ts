import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Workshop } from '../types/workshop';

const MY_WORKSHOPS_KEY = ['workshops', 'mine'];

export function useMyWorkshops() {
  return useQuery({
    queryKey: MY_WORKSHOPS_KEY,
    queryFn: () => apiClient.get<Workshop[]>('/workshops/mine'),
    staleTime: 60_000,
  });
}
