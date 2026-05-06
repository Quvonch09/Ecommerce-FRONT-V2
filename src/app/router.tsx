import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthGate } from "@/features/auth/AuthGate";
import { homePathByRole } from "@/features/auth/roles";
import { useAuthStore } from "@/features/auth/store";
import { AdminDashboardPage } from "@/pages/Admin/AdminDashboardPage";
import { AdminFinancePage } from "@/pages/Admin/AdminFinancePage";
import { AdminNotificationsPage } from "@/pages/Admin/AdminNotificationsPage";
import { AdminOrdersPage } from "@/pages/Admin/AdminOrdersPage";
import { AdminProductsPage } from "@/pages/Admin/AdminProductsPage";
import { AdminSellersPage } from "@/pages/Admin/AdminSellersPage";
import { AdminStockPage } from "@/pages/Admin/AdminStockPage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { ClientCartPage } from "@/pages/Client/ClientCartPage";
import { ClientCatalogPage } from "@/pages/Client/ClientCatalogPage";
import { ClientDebtsPage } from "@/pages/Client/ClientDebtsPage";
import { ClientOrdersPage } from "@/pages/Client/ClientOrdersPage";
import { ProfilePage } from "@/pages/Profile/ProfilePage";
import { AppLayout } from "@/widgets/Layout/AppLayout";

function ProtectedShell() {
  return (
    <AuthGate>
      <Outlet />
    </AuthGate>
  );
}

function RoleLanding() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={homePathByRole(user?.role)} replace />;
}

function AdminShell() {
  const role = useAuthStore((state) => state.user?.role);

  return (
    <AuthGate allowedRoles={["ROLE_ADMIN", "ROLE_SELLER"]}>
      <AppLayout area="admin" canManageAdmin={role === "ROLE_ADMIN"}>
        <Outlet />
      </AppLayout>
    </AuthGate>
  );
}

function ClientShell() {
  return (
    <AuthGate>
      <AppLayout area="client" canManageAdmin={false}>
        <Outlet />
      </AppLayout>
    </AuthGate>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<RoleLanding />} />
          <Route path="/app" element={<ClientShell />}>
            <Route index element={<Navigate to="catalog" replace />} />
            <Route path="catalog" element={<ClientCatalogPage />} />
            <Route path="cart" element={<ClientCartPage />} />
            <Route path="orders" element={<ClientOrdersPage />} />
            <Route path="debts" element={<ClientDebtsPage />} />
            <Route
              path="profile"
              element={<ProfilePage title="Client profile" subtitle="Account overview" />}
            />
          </Route>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="stock" element={<AdminStockPage />} />
            <Route path="sellers" element={<AdminSellersPage />} />
            <Route path="finance" element={<AdminFinancePage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route
              path="profile"
              element={<ProfilePage title="Admin profile" subtitle="Workspace account" />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
