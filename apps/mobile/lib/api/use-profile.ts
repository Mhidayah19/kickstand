import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { UserProfile, UpdateProfileInput } from '../types/profile';

const PROFILE_KEY = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => apiClient.get<UserProfile>('/users/me'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiClient.patch<UserProfile>('/users/me', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}
