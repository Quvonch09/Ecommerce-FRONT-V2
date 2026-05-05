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
      setAuthenticating(true);

      try {
        const profile = extractTelegramProfile(telegram);
        setTelegramProfile(profile);

        if (!token) {
          if (!profile?.telegramId) {
            setBootstrapped(true);
            return;
          }

          const nextToken = await telegramLogin(profile.telegramId);
          const me = await fetchMe();
          login(nextToken, me);
          setBootstrapped(true);
          return;
        }

        const me = await fetchMe();
        login(token, me);
        setBootstrapped(true);
      } catch {
        logout();
      } finally {
        setAuthenticating(false);
      }
    };

    void run();
  }, [login, logout, setAuthenticating, setBootstrapped, setTelegramProfile, telegram, token]);

  return null;
}
