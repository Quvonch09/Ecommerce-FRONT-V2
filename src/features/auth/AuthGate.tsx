import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "@/shared/ui/Loader";
import { useAuthStore } from "./store";

export function AuthGate({ children }: PropsWithChildren) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const telegramProfile = useAuthStore((state) => state.telegramProfile);

  if (!isBootstrapped || isAuthenticating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader />
        <p className="mt-4 animate-pulse text-sm text-tg-hint">Initializing app...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname, hasTelegramProfile: Boolean(telegramProfile) }}
      />
    );
  }

  return <>{children}</>;
}
