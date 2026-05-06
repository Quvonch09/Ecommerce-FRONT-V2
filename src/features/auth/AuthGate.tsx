import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@/entities/user/model";
import { Loader } from "@/shared/ui/Loader";
import { homePathByRole } from "./roles";
import { useAuthStore } from "./store";

type Props = PropsWithChildren<{
  allowedRoles?: UserRole[];
}>;

export function AuthGate({ children, allowedRoles }: Props) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
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

  if (allowedRoles?.length && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathByRole(user.role)} replace />;
  }

  return <>{children}</>;
}
