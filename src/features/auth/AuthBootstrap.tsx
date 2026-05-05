import { useEffect } from "react";
import { bindUnauthorizedHandler } from "@/shared/api/axios";
import { useTelegramWebApp } from "@/shared/hooks/useTelegramWebApp";
import { extractTelegramProfile } from "@/shared/utils/telegram";
import { fetchMe, telegramLogin } from "./api";
import { useAuthStore } from "./store";

export function AuthBootstrap() {
  const telegram = useTelegramWebApp();
  const {
    token,
    login,
    logout,
    setTelegramProfile,
    setAuthenticating,
    setBootstrapped,
  } = useAuthStore();

  useEffect(() => {
    bindUnauthorizedHandler(() => logout());
  }, [logout]);

  useEffect(() => {
    const run = async () => {
      // If already bootstrapped and we have a user, do nothing
      if (useAuthStore.getState().isBootstrapped && useAuthStore.getState().user) {
        return;
      }

      setAuthenticating(true);

      try {
        const profile = extractTelegramProfile(telegram);
        setTelegramProfile(profile);

        if (!token) {
          if (profile?.telegramId) {
            const nextToken = await telegramLogin(profile.telegramId);
            const me = await fetchMe();
            login(nextToken, me);
          }
        } else {
          try {
            const me = await fetchMe();
            login(token, me);
          } catch (e) {
            console.error("Token validation failed", e);
            logout();
          }
        }
      } catch (error) {
        console.error("Auth bootstrap error:", error);
      } finally {
        setBootstrapped(true);
        setAuthenticating(false);
      }
    };

    run();
  }, [telegram, token, login, logout, setTelegramProfile, setAuthenticating, setBootstrapped]);

  return null;
}
