import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";

type Props = PropsWithChildren<{
  area: "admin" | "client";
  canManageAdmin: boolean;
}>;

type NavItem = {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

const clientNav: NavItem[] = [
  { to: "/app/catalog", label: "Catalog", icon: "Shop" },
  { to: "/app/cart", label: "Cart", icon: "Cart" },
  { to: "/app/orders", label: "Orders", icon: "List" },
  { to: "/app/debts", label: "Debts", icon: "Debt" },
  { to: "/app/profile", label: "Profile", icon: "User" },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dash", icon: "Stat", adminOnly: true },
  { to: "/admin/products", label: "Products", icon: "Box" },
  { to: "/admin/orders", label: "Orders", icon: "List" },
  { to: "/admin/stock", label: "Stock", icon: "Stock" },
  { to: "/admin/sellers", label: "Sellers", icon: "Team", adminOnly: true },
  { to: "/admin/finance", label: "Finance", icon: "Cash" },
  { to: "/admin/notifications", label: "Bot", icon: "Bot", adminOnly: true },
  { to: "/admin/profile", label: "Profile", icon: "User" },
];

export function AppLayout({ area, canManageAdmin, children }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navItems = (area === "admin" ? adminNav : clientNav).filter(
    (item) => !item.adminOnly || canManageAdmin,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,144,66,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(19,126,255,0.18),_transparent_26%),linear-gradient(180deg,_#fff9f2_0%,_#f3f7fb_50%,_#eef3f8_100%)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-3 py-3 sm:px-4">
        <header className="animate-rise rounded-[28px] border border-white/70 bg-white/88 p-4 shadow-soft backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={clsx(
                  "text-[11px] font-semibold uppercase tracking-[0.28em]",
                  area === "admin" ? "text-sky-600" : "text-orange-500",
                )}
              >
                {area === "admin" ? "Admin panel" : "User panel"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {area === "admin" ? "Operations workspace" : "Mini store"}
              </h1>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {user?.firstName} {user?.lastName} | {user?.role}
              </p>
            </div>

            <button
              className="rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 pb-24 pt-4">{children}</main>

        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/96 px-3 py-3 backdrop-blur">
          <div
            className={clsx(
              "mx-auto grid max-w-md gap-2",
              navItems.length <= 5 ? "grid-cols-5" : "grid-cols-4",
            )}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "flex min-h-[60px] flex-col items-center justify-center rounded-[18px] px-2 py-2 text-center transition",
                    isActive
                      ? area === "admin"
                        ? "bg-sky-50 text-slate-950"
                        : "bg-orange-50 text-slate-950"
                      : "text-slate-500",
                  )
                }
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                  {item.icon}
                </span>
                <span className="mt-1 text-[11px] font-semibold leading-4">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
