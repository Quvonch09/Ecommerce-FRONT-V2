import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";
import { homePathByRole, isManagerRole } from "@/features/auth/roles";

type Props = PropsWithChildren<{
  area: "admin" | "client";
  canManageAdmin: boolean;
}>;

type NavItem = {
  to: string;
  label: string;
  subtitle: string;
  adminOnly?: boolean;
};

const clientNav: NavItem[] = [
  { to: "/app/catalog", label: "Catalog", subtitle: "Products" },
  { to: "/app/cart", label: "Cart", subtitle: "Checkout" },
  { to: "/app/orders", label: "Orders", subtitle: "History" },
  { to: "/app/debts", label: "Debts", subtitle: "Payments" },
  { to: "/app/profile", label: "Profile", subtitle: "Account" },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", subtitle: "Analytics", adminOnly: true },
  { to: "/admin/products", label: "Products", subtitle: "Catalog" },
  { to: "/admin/orders", label: "Orders", subtitle: "Status flow" },
  { to: "/admin/stock", label: "Stock", subtitle: "Warehouse" },
  { to: "/admin/sellers", label: "Sellers", subtitle: "Users", adminOnly: true },
  { to: "/admin/finance", label: "Finance", subtitle: "Debt & payment" },
  { to: "/admin/notifications", label: "Bot", subtitle: "Telegram", adminOnly: true },
  { to: "/admin/profile", label: "Profile", subtitle: "Account" },
];

export function AppLayout({ area, canManageAdmin, children }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const currentHome = homePathByRole(user?.role);
  const showAdminLink = canManageAdmin || isManagerRole(user?.role);
  const navItems = (area === "admin" ? adminNav : clientNav).filter(
    (item) => !item.adminOnly || canManageAdmin,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,144,66,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(19,126,255,0.18),_transparent_26%),linear-gradient(180deg,_#fff9f2_0%,_#f3f7fb_50%,_#eef3f8_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="animate-rise rounded-[32px] border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
                Store control center
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {area === "admin" ? "Operations workspace" : "Client storefront"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Role-based interface connected to the live `qdtu.uz` backend.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="rounded-[24px] border border-slate-200 bg-slate-950 px-4 py-3 text-white">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Signed in</div>
                <div className="mt-1 text-base font-semibold">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm text-white/70">
                  {user?.role} {user?.telegramId ? `| ID ${user.telegramId}` : ""}
                </div>
              </div>

              <button
                className="rounded-[20px] border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <NavLink
              to="/app/catalog"
              className={({ isActive }) =>
                clsx(
                  "rounded-[26px] border p-4 transition",
                  isActive || area === "client"
                    ? "border-orange-300 bg-orange-50 text-slate-950"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50/50",
                )
              }
            >
              <div className="text-xs uppercase tracking-[0.22em] text-orange-500">Client</div>
              <div className="mt-2 text-lg font-semibold">Shopping and debt actions</div>
              <div className="mt-1 text-sm">Catalog, cart, orders, debts and profile.</div>
            </NavLink>

            {showAdminLink ? (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  clsx(
                    "rounded-[26px] border p-4 transition",
                    isActive || area === "admin"
                      ? "border-sky-300 bg-sky-50 text-slate-950"
                      : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50/50",
                  )
                }
              >
                <div className="text-xs uppercase tracking-[0.22em] text-sky-600">Admin</div>
                <div className="mt-2 text-lg font-semibold">Operational control</div>
                <div className="mt-1 text-sm">
                  Dashboard, products, orders, stock, sellers and Telegram bot actions.
                </div>
              </NavLink>
            ) : (
              <div className="rounded-[26px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Your role is client-only. Admin workspace is hidden for this account.
              </div>
            )}
          </div>

          <div className="mt-5 text-sm text-slate-500">
            Default landing:{" "}
            <span className="font-semibold text-slate-800">
              {currentHome === "/admin" ? "Admin workspace" : "Client storefront"}
            </span>
          </div>
        </header>

        <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="animate-rise rounded-[28px] border border-white/70 bg-white/82 p-4 shadow-soft backdrop-blur">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {area === "admin" ? "Admin navigation" : "Client navigation"}
            </div>
            <nav className="mt-4 grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      "rounded-[20px] border px-4 py-3 transition",
                      isActive
                        ? area === "admin"
                          ? "border-sky-300 bg-sky-50 text-slate-950"
                          : "border-orange-300 bg-orange-50 text-slate-950"
                        : "border-transparent bg-slate-50 text-slate-600 hover:border-slate-200 hover:bg-white",
                    )
                  }
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {item.subtitle}
                  </div>
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
