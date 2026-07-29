// lib/stores/useUserStore.ts
import { create } from "zustand";
import type { User } from "../auth";  // ← single source of truth

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
