import { create } from 'zustand';
import type { OcrResponse } from './types';

interface OcrStoreState {
  pending: OcrResponse | null;
  setPending: (payload: OcrResponse) => void;
  clear: () => void;
}

export const useOcrStore = create<OcrStoreState>((set) => ({
  pending: null,
  setPending: (payload) => set({ pending: payload }),
  clear: () => set({ pending: null }),
}));
