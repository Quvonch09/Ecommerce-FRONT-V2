import { useEffect, useState } from "react";
import type { Order } from "@/entities/order/model";
import { getApiErrorMessage, getMyOrders } from "@/features/app/api";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { formatDate, tone } from "@/shared/utils/format";

export function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setOrders(await getMyOrders());
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid gap-6">
      <PageSection title="My orders" subtitle="Order history API">
        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Order #{order.id}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-base font-semibold text-slate-950">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm">
                      <span className="font-medium text-slate-800">{item.productName}</span>
                      <span className="text-slate-500">
                        {item.quantity} x {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Order topilmadi" description="Hali ushbu akkaunt orqali order yaratilmagan." />
        )}
      </PageSection>

      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
