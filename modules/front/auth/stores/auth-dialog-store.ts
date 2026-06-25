import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthDialogStore {
  isSignUpOpen: boolean;
  setSignUpOpen: (open: boolean) => void;
}

export const useAuthDialogStore = create<AuthDialogStore>()(
  devtools((set) => ({
    isSignUpOpen: false,

    setSignUpOpen: (open) =>
      set({ isSignUpOpen: open }, false, 'setSignupOpen'),
  })),
);
