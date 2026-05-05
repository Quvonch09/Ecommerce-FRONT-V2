import { useEffect } from "react";
import { bindUnauthorizedHandler } from "@/shared/api/axios";
import { useTelegramWebApp } from "@/shared/hooks/useTelegramWebApp";
import { extractTelegramProfile } from "@/shared/utils/telegram";
import { fetchMe, getAuthErrorMessage, telegramLogin } from "./api";
import { useAuthStore } from "./store";

export function AuthBootstrap() {
  const telegram = useTelegramWebApp();
  const {
    token,
    login,
    logout,
    setTelegramProfile,
    setAuthError,
    setAuthenticating,
    setBootstrapped,
  } = useAuthStore();

  useEffect(() => {
    bindUnauthorizedHandler(() => logout());
  }, [logout]);

  useEffect(() => {
    const run = async () => {
      if (token && useAuthStore.getState().user) {
        setBootstrapped(true);
        return;
      }

      setAuthenticating(true);

      try {
        const profile = extractTelegramProfile(telegram);
        setTelegramProfile(profile);
        setAuthError(null);

        if (!token) {
          if (!profile?.telegramId) {
            setAuthError(
              telegram
                ? "Telegram user data kelmadi. Mini App bot ichidagi WebApp tugmasi orqali ochilganini tekshiring."
                : "Telegram WebApp API topilmadi. Ilovani aynan Telegram ichida oching.",
            );
            setBootstrapped(true);
            return;
          }

          const nextToken = await telegramLogin(profile.telegramId);
          const me = await fetchMe();
          login(nextToken, me);
        } else {
          const me = await fetchMe();
          login(token, me);
        }
      } catch (error) {
        setAuthError(`Telegram login ishlamadi: ${getAuthErrorMessage(error)}`);

        if (token) {
          logout();
          return;
        }
      } finally {
        setBootstrapped(true);
        setAuthenticating(false);
      }
    };

    void run();
  }, [
    login,
    logout,
    setAuthError,
    setAuthenticating,
    setBootstrapped,
    setTelegramProfile,
    telegram,
    token,
  ]);

  return null;
}
