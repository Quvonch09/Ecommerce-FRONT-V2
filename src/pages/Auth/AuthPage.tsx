import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store";
import { useTelegramWebApp } from "@/shared/hooks/useTelegramWebApp";
import { Button } from "@/shared/ui/Button";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, telegramProfile, isAuthenticating, authError } = useAuthStore((state) => ({
    token: state.token,
    telegramProfile: state.telegramProfile,
    isAuthenticating: state.isAuthenticating,
    authError: state.authError,
  }));

  useTelegramWebApp();

  useEffect(() => {
    if (token) {
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    }
  }, [location.state, navigate, token]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="animate-rise rounded-[32px] bg-white p-7 shadow-soft">
        <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          Telegram Mini App
        </div>
        <h1 className="mt-5 text-3xl font-semibold text-tg-text">Store access</h1>
        <p className="mt-3 text-sm leading-6 text-tg-hint">
          Authentication runs through Telegram WebApp user data. Open this app inside Telegram to
          receive your JWT token automatically.
        </p>

        {isAuthenticating ? (
          <div className="mt-6 rounded-3xl bg-sky-50 p-4 text-sm text-sky-700">
            Telegram profiling va backend login tekshirilmoqda...
          </div>
        ) : null}

        {telegramProfile ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm text-tg-text">
            <div className="font-semibold">
              {telegramProfile.firstName} {telegramProfile.lastName}
            </div>
            <div className="mt-1 text-tg-hint">
              @{telegramProfile.username || "no_username"} | ID {telegramProfile.telegramId}
            </div>
          </div>
        ) : null}

        {authError ? (
          <div className="mt-6 rounded-3xl bg-rose-50 p-4 text-sm leading-6 text-rose-700">
            {authError}
          </div>
        ) : null}

        <Button fullWidth className="mt-8" onClick={() => window.location.reload()}>
          Retry Telegram login
        </Button>
      </div>
    </div>
  );
}
