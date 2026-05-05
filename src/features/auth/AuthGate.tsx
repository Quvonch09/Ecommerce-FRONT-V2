import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader } from "@/shared/ui/Loader";
import { useAuthStore } from "./store";

export function AuthGate({ children }: PropsWithChildren) {
  const location = useLocation();
  const { token, isBootstrapped, isAuthenticating, telegramProfile } = useAuthStore();

  if (!isBootstrapped || isAuthenticating) {
    return <Loader />;
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
