import type { PropsWithChildren } from "react";
import { AuthBootstrap } from "@/features/auth/AuthBootstrap";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <>
      <AuthBootstrap />
      {children}
    </>
  );
}
