import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { WorkshopSuggestion } from '../types/workshop';

interface SearchParams {
  query: string;
  sessionToken: string;
  lat?: number;
  lng?: number;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

export function useWorkshopSearch(params: SearchParams) {
  const debouncedQuery = useDebouncedValue(params.query, 300);
  const trimmed = debouncedQuery.trim();

  return useQuery({
    queryKey: [
      'workshops',
      'search',
      trimmed,
      params.lat ?? null,
      params.lng ?? null,
      params.sessionToken,
    ],
    queryFn: () => {
      const qs = new URLSearchParams({
        q: trimmed,
        sessionToken: params.sessionToken,
      });
      if (params.lat != null) qs.set('lat', String(params.lat));
      if (params.lng != null) qs.set('lng', String(params.lng));
      return apiClient.get<WorkshopSuggestion[]>(
        `/workshops/search?${qs.toString()}`,
      );
    },
    enabled: trimmed.length >= 2,
    staleTime: 30_000,
  });
}
