import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Workshop } from '../types/workshop';

export function useCreateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; address?: string }) =>
      apiClient.post<Workshop>('/workshops', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshops', 'mine'] }),
  });
}
