import type { TelegramProfile } from "@/entities/user/model";
import type { User } from "@/entities/user/model";

export type AuthState = {
  token: string | null;
  user: User | null;
  telegramProfile: TelegramProfile | null;
  authError: string | null;
  isAuthenticating: boolean;
  isBootstrapped: boolean;
  setTelegramProfile: (profile: TelegramProfile | null) => void;
  setAuthError: (message: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setAuthenticating: (value: boolean) => void;
  setBootstrapped: (value: boolean) => void;
};
