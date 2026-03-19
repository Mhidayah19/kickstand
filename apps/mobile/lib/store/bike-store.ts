import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_BIKE_KEY = 'activeBikeId';

interface BikeState {
  activeBikeId: string | null;
  setActiveBikeId: (id: string | null) => void;
  hydrate: () => Promise<void>;
}

export const useBikeStore = create<BikeState>((set) => ({
  activeBikeId: null,
  setActiveBikeId: (id) => {
    if (id === null) {
      AsyncStorage.removeItem(ACTIVE_BIKE_KEY);
    } else {
      AsyncStorage.setItem(ACTIVE_BIKE_KEY, id);
    }
    set({ activeBikeId: id });
  },
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(ACTIVE_BIKE_KEY);
    if (stored) set({ activeBikeId: stored });
  },
}));

// Hydrate on import
useBikeStore.getState().hydrate();
