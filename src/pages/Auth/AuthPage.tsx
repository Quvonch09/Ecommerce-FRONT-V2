import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchMeWithToken, getAuthErrorMessage, telegramLogin } from "@/features/auth/api";
import { homePathByRole } from "@/features/auth/roles";
import { useAuthStore } from "@/features/auth/store";
import { useTelegramWebApp } from "@/shared/hooks/useTelegramWebApp";
import { Button } from "@/shared/ui/Button";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [manualTelegramId, setManualTelegramId] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const telegramProfile = useAuthStore((state) => state.telegramProfile);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const authError = useAuthStore((state) => state.authError);
  const setToken = useAuthStore((state) => state.setToken);
  const login = useAuthStore((state) => state.login);
  const setAuthError = useAuthStore((state) => state.setAuthError);

  useTelegramWebApp();

  useEffect(() => {
    if (token) {
      const from = (location.state as { from?: string } | null)?.from ?? homePathByRole(user?.role);
      navigate(from, { replace: true });
    }
  }, [location.state, navigate, token, user?.role]);

  const handleManualLogin = async () => {
    if (!manualTelegramId.trim()) {
      setAuthError("Telegram ID kiriting.");
      return;
    }

    setManualLoading(true);
    setAuthError(null);

    try {
      const nextToken = await telegramLogin(manualTelegramId.trim());
      setToken(nextToken);
      const me = await fetchMeWithToken(nextToken);
      login(nextToken, me);
    } catch (error) {
      setAuthError(`Manual login ishlamadi: ${getAuthErrorMessage(error)}`);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_32%),linear-gradient(180deg,_#fff9f2_0%,_#eef3f8_100%)] px-4 py-8">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="animate-rise rounded-[36px] border border-white/80 bg-slate-950 p-8 text-white shadow-soft">
          <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">
            QDTU Store Platform
          </div>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
            Role-based admin va client experience bitta login orqali.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
            Telegram auth ishlatiladi. Login bo'lgach foydalanuvchi `ROLE_ADMIN`,
            `ROLE_SELLER` yoki `ROLE_USER` bo'yicha mos sahifaga yo'naltiriladi.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Admin workspace</div>
              <div className="mt-3 text-lg font-semibold">Dashboard, orders, stock, bot</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Client storefront</div>
              <div className="mt-3 text-lg font-semibold">Catalog, cart, delivery, debt</div>
            </div>
          </div>
        </div>

        <div className="animate-rise rounded-[36px] border border-white/80 bg-white/92 p-7 shadow-soft backdrop-blur">
          <div className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
            Telegram Login
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-tg-text">Store access</h2>
          <p className="mt-3 text-sm leading-6 text-tg-hint">
            Ilovani Telegram ichida ochsangiz token avtomatik olinadi. Brauzer testida esa pastdagi manual login ishlaydi.
          </p>

          {isAuthenticating ? (
            <div className="mt-6 rounded-[24px] bg-orange-50 p-4 text-sm text-orange-700">
              Telegram profiling va backend login tekshirilmoqda...
            </div>
          ) : null}

          {telegramProfile ? (
            <div className="mt-6 rounded-[24px] bg-slate-50 p-4 text-sm text-tg-text">
              <div className="font-semibold">
                {telegramProfile.firstName} {telegramProfile.lastName}
              </div>
              <div className="mt-1 text-tg-hint">
                @{telegramProfile.username || "no_username"} | ID {telegramProfile.telegramId}
              </div>
            </div>
          ) : null}

          {authError ? (
            <div className="mt-6 rounded-[24px] bg-rose-50 p-4 text-sm leading-6 text-rose-700">
              {authError}
            </div>
          ) : null}

          {!telegramProfile ? (
            <div className="mt-6 rounded-[24px] border border-slate-200 p-4">
              <div className="text-sm font-semibold text-tg-text">Manual dev login</div>
              <p className="mt-2 text-sm leading-6 text-tg-hint">
                Browser yoki localhost testlari uchun backendda mavjud Telegram ID kiriting.
              </p>
              <input
                value={manualTelegramId}
                onChange={(event) => setManualTelegramId(event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                placeholder="Telegram ID"
                className="mt-4 w-full rounded-[18px] border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400"
              />
              <Button
                fullWidth
                className="mt-4"
                onClick={handleManualLogin}
                disabled={manualLoading}
              >
                {manualLoading ? "Logging in..." : "Login with Telegram ID"}
              </Button>
            </div>
          ) : null}

          <Button fullWidth className="mt-8" variant="secondary" onClick={() => window.location.reload()}>
            Retry Telegram login
          </Button>
        </div>
      </div>
    </div>
  );
}
