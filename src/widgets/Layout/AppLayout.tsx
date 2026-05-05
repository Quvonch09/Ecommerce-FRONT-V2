import type { PropsWithChildren } from "react";
import { Navbar } from "@/widgets/Navbar/Navbar";

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 px-4 pb-6 pt-5">{children}</main>
      <Navbar />
    </div>
  );
}
