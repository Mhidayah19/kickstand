import { renderHook, act } from '@testing-library/react-native';
import { useServiceLogForm } from './use-service-log-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('prefillFromOcr', () => {
  it('populates date, cost, parts, serviceType, and receiptUrls', () => {
    const { result } = renderHook(() => useServiceLogForm('bike-1', 10_000), { wrapper });
    act(() => {
      result.current.prefillFromOcr({
        fields: {
          date: '2026-04-12',
          cost: '185.00',
          workshopName: 'Mah Pte Ltd',
          parts: ['Engine oil', 'Oil filter'],
          description: 'Oil change service.',
          serviceType: 'oil_change',
          confidence: 0.9,
        },
        workshopId: 'workshop-1',
        receiptUrl: 'https://x/receipt.jpg',
        cacheHit: false,
      });
    });

    expect(result.current.date).toBe('2026-04-12');
    expect(result.current.serviceTypeKey).toBe('oil_change');
    expect(result.current.parts.map((p) => p.value)).toEqual(['Engine oil', 'Oil filter']);
    expect(result.current.receiptUrls).toContain('https://x/receipt.jpg');
  });

  it('leaves mileage untouched', () => {
    const { result } = renderHook(() => useServiceLogForm('bike-1', 10_000), { wrapper });
    const before = result.current.mileage;
    act(() => {
      result.current.prefillFromOcr({
        fields: { date: '2026-04-12', cost: '50', workshopName: null, parts: [], description: null, serviceType: null, confidence: 0.9 },
        workshopId: null,
        receiptUrl: 'https://x/a',
        cacheHit: false,
      });
    });
    expect(result.current.mileage).toBe(before);
  });
});
