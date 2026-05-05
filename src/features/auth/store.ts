import { create } from "zustand";
import type { User } from "@/entities/user/model";
import { STORAGE_KEYS } from "@/shared/constants/config";
import type { AuthState } from "./types";

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(STORAGE_KEYS.token),
  user: null,
  telegramProfile: null,
  authError: null,
  isAuthenticating: false,
  isBootstrapped: false,
  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }

    set({ token });
  },
  setTelegramProfile: (profile) => set({ telegramProfile: profile }),
  setAuthError: (authError) => set({ authError }),
  login: (token: string, user: User) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    set({ token, user, authError: null });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    set({
      token: null,
      user: null,
      telegramProfile: null,
      authError: null,
      isAuthenticating: false,
      isBootstrapped: true,
    });
  },
  setAuthenticating: (value) => set({ isAuthenticating: value }),
  setBootstrapped: (value) => set({ isBootstrapped: value }),
}));
