import { useOcrStore } from './ocr-store';

describe('useOcrStore', () => {
  beforeEach(() => useOcrStore.getState().clear());

  it('stores and clears pending payload', () => {
    useOcrStore.getState().setPending({
      fields: { date: '2026-04-12', cost: '50', workshopName: null, parts: [], description: null, serviceType: null, confidence: 0.9 },
      workshopId: null,
      receiptUrl: 'https://x/a',
      cacheHit: false,
    });
    expect(useOcrStore.getState().pending?.receiptUrl).toBe('https://x/a');
    useOcrStore.getState().clear();
    expect(useOcrStore.getState().pending).toBeNull();
  });
});
