/**
 * PSL Pulse Zustand Store
 * State management for the application
 */

import { create } from 'zustand';
import type { User, Match, AppStore as AppStoreType } from './types';
import toast from 'react-hot-toast';

export const useAppStore = create<AppStoreType>((set) => ({
  // User State
  user: null,
  setUser: (user) => set({ user }),

  // Matches
  matches: [],
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),

  // Loading State
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Error State
  error: null,
  setError: (error) => set({ error }),

  // Toast Notifications
  showToast: (message, type) => {
    switch (type) {
      case 'success':
        toast.success(message, {
          style: {
            background: '#1a0f2e',
            color: '#f5a5d1',
            border: '2px solid #d97bb6',
          },
        });
        break;
      case 'error':
        toast.error(message, {
          style: {
            background: '#1a0f2e',
            color: '#ff6b9d',
            border: '2px solid #ff6b9d',
          },
        });
        break;
      case 'info':
        toast.loading(message, {
          style: {
            background: '#1a0f2e',
            color: '#f5a5d1',
            border: '2px solid #9b7bc4',
          },
        });
        break;
    }
  },
}));

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useMatches = () => useAppStore((state) => state.matches);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
