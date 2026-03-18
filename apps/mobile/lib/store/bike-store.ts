import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'bike-store' });
const ACTIVE_BIKE_KEY = 'activeBikeId';

interface BikeState {
  activeBikeId: string | null;
  setActiveBikeId: (id: string | null) => void;
}

export const useBikeStore = create<BikeState>((set) => ({
  activeBikeId: storage.getString(ACTIVE_BIKE_KEY) ?? null,
  setActiveBikeId: (id) => {
    if (id === null) {
      storage.delete(ACTIVE_BIKE_KEY);
    } else {
      storage.set(ACTIVE_BIKE_KEY, id);
    }
    set({ activeBikeId: id });
  },
}));
