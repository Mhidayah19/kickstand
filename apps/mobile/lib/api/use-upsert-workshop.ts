import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Workshop } from '../types/workshop';

export function useUpsertWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { placeId: string; sessionToken: string }) =>
      apiClient.post<Workshop>('/workshops/upsert-from-place', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshops', 'mine'] }),
  });
}
