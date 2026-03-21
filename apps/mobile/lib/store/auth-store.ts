import { create } from 'zustand';
import { log } from './log-middleware';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  log(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: user !== null }),
    }),
    'AuthStore',
  ),
);
