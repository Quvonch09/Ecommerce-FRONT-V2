import { create } from "zustand";
import type { User } from "@/entities/user/model";
import { STORAGE_KEYS } from "@/shared/constants/config";
import type { AuthState } from "./types";

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(STORAGE_KEYS.token),
  user: null,
  telegramProfile: null,
  isAuthenticating: false,
  isBootstrapped: false,
  setTelegramProfile: (profile) => set({ telegramProfile: profile }),
  login: (token: string, user: User) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    set({
      token: null,
      user: null,
      telegramProfile: null,
      isAuthenticating: false,
      isBootstrapped: true,
    });
  },
  setAuthenticating: (value) => set({ isAuthenticating: value }),
  setBootstrapped: (value) => set({ isBootstrapped: value }),
}));
