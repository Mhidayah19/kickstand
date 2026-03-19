import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Bike, CreateBikeInput, UpdateBikeInput, UpdateMileageInput } from '../types/bike';

const BIKES_KEY = ['bikes'];
const bikeKey = (id: string) => ['bikes', id];

export function useBikes() {
  return useQuery({
    queryKey: BIKES_KEY,
    queryFn: () => apiClient.get<Bike[]>('/bikes'),
  });
}

export function useBike(id: string | null) {
  return useQuery({
    queryKey: id ? bikeKey(id) : ['bikes', '__disabled__'],
    queryFn: () => apiClient.get<Bike>(`/bikes/${id}`),
    enabled: !!id,
  });
}

export function useCreateBike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBikeInput) => apiClient.post<Bike>('/bikes', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BIKES_KEY }),
  });
}

export function useUpdateBike(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBikeInput) => apiClient.patch<Bike>(`/bikes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIKES_KEY });
      queryClient.invalidateQueries({ queryKey: bikeKey(id) });
    },
  });
}

export function useUpdateMileage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMileageInput) =>
      apiClient.patch<Bike>(`/bikes/${id}/mileage`, data),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BIKES_KEY }),
  });
}
