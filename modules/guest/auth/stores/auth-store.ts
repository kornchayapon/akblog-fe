import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { User } from '@/lib/interfaces/user';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;

  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  setHydrated: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isHydrated: false,

        setUser: (user) => set({ user }, false, 'setUser'),
        setAccessToken: (token) =>
          set({ accessToken: token }, false, 'setAccessToken'),
        setHydrated: () => set({ isHydrated: true }, false, 'setHydrated'),
        clearAuth: () =>
          set({ user: null, accessToken: null }, false, 'clearAuth'),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
        }),
      },
    ),
  ),
);

export const authStore = useAuthStore;