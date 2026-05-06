import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthGate } from "@/features/auth/AuthGate";
import { homePathByRole } from "@/features/auth/roles";
import { useAuthStore } from "@/features/auth/store";
import { AdminPage } from "@/pages/Admin/AdminPage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { ClientPage } from "@/pages/Client/ClientPage";
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
        <AdminPage />
      </AppLayout>
    </AuthGate>
  );
}

function ClientShell() {
  return (
    <AuthGate>
      <AppLayout area="client" canManageAdmin={false}>
        <ClientPage />
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
          <Route path="/app" element={<ClientShell />} />
          <Route path="/admin" element={<AdminShell />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
