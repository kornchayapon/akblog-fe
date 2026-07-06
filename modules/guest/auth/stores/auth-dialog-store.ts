import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AuthDialogStore {
  isSignUpOpen: boolean;
  isSignInOpen: boolean;

  setSignUpOpen: (open: boolean) => void;
  setSignInOpen: (open: boolean) => void;
}

export const useAuthDialogStore = create<AuthDialogStore>()(
  devtools((set) => ({
    isSignUpOpen: false,
    isSignInOpen: false,

    setSignUpOpen: (open) =>
      set({ isSignUpOpen: open }, false, 'setSignupOpen'),
    setSignInOpen: (open) =>
      set({ isSignInOpen: open }, false, 'setSignInOpen'),
  })),
);
