import { useEffect, useState } from "react";
import type { DeliveryStatus } from "@/entities/delivery/model";
import type { Order, OrderStatus } from "@/entities/order/model";
import {
  getAllOrders,
  getApiErrorMessage,
  getOrder,
  updateDeliveryStatus,
  updateOrderStatus,
} from "@/features/app/api";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { formatDate, tone } from "@/shared/utils/format";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<number, DeliveryStatus>>({});
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setOrders(await getAllOrders());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOrderDetail = async (id: number) => {
    setBusy(`order-${id}`);
    try {
      setSelectedOrder(await getOrder(id));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleOrderStatus = async (id: number) => {
    const status = orderStatusDrafts[id];
    if (!status) {
      setErrorMessage("Status tanlang.");
      return;
    }

    setBusy(`status-${id}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await updateOrderStatus(id, status);
      setStatusMessage(`Order #${id} statusi yangilandi.`);
      await loadData();
      if (selectedOrder?.id === id) {
        await handleOrderDetail(id);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleDeliveryStatus = async (orderId: number) => {
    const deliveryStatus = deliveryDrafts[orderId];
    if (!deliveryStatus) {
      setErrorMessage("Delivery status tanlang.");
      return;
    }

    const deliveryId = Number(window.prompt("Delivery ID ni kiriting:", ""));
    if (!deliveryId) {
      return;
    }

    setBusy(`delivery-${orderId}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await updateDeliveryStatus(deliveryId, deliveryStatus);
      setStatusMessage(`Delivery #${deliveryId} statusi yangilandi.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <PageSection title="Orders" subtitle="Admin order APIs">
        {orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">Order #{order.id}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      User #{order.userId} | {formatDate(order.createdAt)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Total: {formatPrice(order.totalAmount)}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[180px_auto_auto]">
                    <select className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300" value={orderStatusDrafts[order.id] ?? order.status} onChange={(event) => setOrderStatusDrafts((current) => ({ ...current, [order.id]: event.target.value as OrderStatus }))}>
                      {["NEW", "CONFIRMED", "DELIVERED", "CANCELLED"].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Button disabled={busy === `status-${order.id}`} onClick={() => void handleOrderStatus(order.id)}>
                      Status
                    </Button>
                    <Button variant="secondary" disabled={busy === `order-${order.id}`} onClick={() => void handleOrderDetail(order.id)}>
                      Detail
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[180px_auto]">
                  <select className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300" value={deliveryDrafts[order.id] ?? "PENDING"} onChange={(event) => setDeliveryDrafts((current) => ({ ...current, [order.id]: event.target.value as DeliveryStatus }))}>
                    {["PENDING", "ON_THE_WAY", "DELIVERED"].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <Button variant="secondary" disabled={busy === `delivery-${order.id}`} onClick={() => void handleDeliveryStatus(order.id)}>
                    Delivery status yangilash
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Order yo'q" description="Admin orders API bo'sh." />
        )}
      </PageSection>

      <PageSection title="Selected order" subtitle="GET single order API">
        {selectedOrder ? (
          <div className="space-y-4">
            <div className="rounded-[22px] bg-slate-950 p-5 text-white">
              <div className="text-sm text-white/60">Order #{selectedOrder.id}</div>
              <div className="mt-2 text-2xl font-semibold">{formatPrice(selectedOrder.totalAmount)}</div>
              <div className="mt-2 text-sm text-white/70">
                User #{selectedOrder.userId} | {formatDate(selectedOrder.createdAt)}
              </div>
            </div>
            {selectedOrder.items.map((item) => (
              <div key={item.id} className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-medium text-slate-900">{item.productName}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {item.quantity} x {formatPrice(item.price)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Order tanlanmagan" description="Order detail ko'rish uchun listdagi Detail tugmasini bosing." />
        )}
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
