import { useEffect, useState } from "react";
import type { Order } from "@/entities/order/model";
import { useAuthStore } from "@/features/auth/store";
import { getMyOrders } from "@/features/order/api";
import { Button } from "@/shared/ui/Button";
import { formatPrice } from "@/shared/utils/currency";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const telegramProfile = useAuthStore((state) => state.telegramProfile);
  const logout = useAuthStore((state) => state.logout);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-4">
      <div className="animate-rise rounded-[30px] bg-white p-5 shadow-soft">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-xl font-bold text-sky-600">
          {(user?.firstName?.[0] || telegramProfile?.firstName?.[0] || "U").toUpperCase()}
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-tg-text">
          {user?.firstName || telegramProfile?.firstName} {user?.lastName || telegramProfile?.lastName}
        </h1>
        <p className="mt-1 text-sm text-tg-hint">@{user?.username || telegramProfile?.username || "unknown"}</p>
        <p className="mt-4 text-sm text-tg-hint">Telegram ID: {user?.telegramId || telegramProfile?.telegramId}</p>
        <p className="mt-1 text-sm text-tg-hint">Role: {user?.role || "ROLE_USER"}</p>
        <Button fullWidth variant="danger" className="mt-6" onClick={logout}>
          Logout
        </Button>
      </div>

      <div className="animate-rise rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-tg-text">My orders</h2>
          <span className="text-sm text-tg-hint">{orders.length}</span>
        </div>

        <div className="mt-4 space-y-3">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-tg-text">Order #{order.id}</div>
                  <div className="text-xs font-medium text-sky-600">{order.status}</div>
                </div>
                <div className="mt-2 text-sm text-tg-hint">{formatPrice(order.totalAmount)}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-tg-hint">No orders found for this account.</p>
          )}
        </div>
      </div>
    </section>
  );
}
