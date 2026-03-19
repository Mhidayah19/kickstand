import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Bike, CreateBikeInput, UpdateBikeInput, UpdateMileageInput } from '../types/bike';

const BIKES_KEY = ['bikes'] as const;
const bikeKey = (id: string) => ['bikes', id] as const;

export function useBikes() {
  return useQuery({
    queryKey: BIKES_KEY,
    queryFn: () => apiClient.get<Bike[]>('/bikes'),
  });
}

export function useBike(id: string | null | undefined) {
  return useQuery({
    queryKey: bikeKey(id ?? ''),
    queryFn: () => apiClient.get<Bike>(`/bikes/${id}`),
    enabled: !!id,
  });
}

export function useCreateBike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBikeInput) => apiClient.post<Bike>('/bikes', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIKES_KEY });
    },
  });
}

export function useUpdateBike(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBikeInput) => apiClient.patch<Bike>(`/bikes/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIKES_KEY });
      queryClient.invalidateQueries({ queryKey: bikeKey(id) });
    },
  });
}

export function useUpdateMileage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMileageInput) =>
      apiClient.patch<Bike>(`/bikes/${id}/mileage`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIKES_KEY });
      queryClient.invalidateQueries({ queryKey: bikeKey(id) });
    },
  });
}

export function useDeleteBike(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.delete<void>(`/bikes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIKES_KEY });
    },
  });
}
