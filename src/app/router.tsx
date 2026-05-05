import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthGate } from "@/features/auth/AuthGate";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { CartPage } from "@/pages/Cart/CartPage";
import { HomePage } from "@/pages/Home/HomePage";
import { ProductPage } from "@/pages/Product/ProductPage";
import { ProfilePage } from "@/pages/Profile/ProfilePage";
import { AppLayout } from "@/widgets/Layout/AppLayout";

function ProtectedShell() {
  return (
    <AuthGate>
      <AppLayout>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
