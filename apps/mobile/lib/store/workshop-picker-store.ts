import { create } from 'zustand';
import { log } from './log-middleware';
import type { WorkshopSelection } from '../types/workshop';

interface WorkshopPickerState {
  pending: WorkshopSelection | null;
  setSelection: (selection: WorkshopSelection) => void;
  consume: () => WorkshopSelection | null;
  clear: () => void;
}

export const useWorkshopPickerStore = create<WorkshopPickerState>()(
  log(
    (set, get) => ({
      pending: null,
      setSelection: (selection) => set({ pending: selection }),
      consume: () => {
        const current = get().pending;
        if (current) set({ pending: null });
        return current;
      },
      clear: () => set({ pending: null }),
    }),
    'WorkshopPickerStore',
  ),
);
