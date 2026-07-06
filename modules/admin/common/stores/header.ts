import { create } from 'zustand';

type HeaderState = {
  title: string;
  setTitle: (title: string) => void;
};

export const useHeader = create<HeaderState>((set) => ({
  title: 'Admin',
  setTitle: (newTitle) => set({ title: newTitle }),
}));
