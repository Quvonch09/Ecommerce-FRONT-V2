import { useState } from "react";
import type { Delivery } from "@/entities/delivery/model";
import { createDelivery, createOrder, getApiErrorMessage } from "@/features/app/api";
import { useCartStore } from "@/features/cart/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";

export function ClientCartPage() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const [deliveryOrderId, setDeliveryOrderId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (createDebtForOrder: boolean) => {
    if (!items.length) {
      return;
    }

    setSubmittingOrder(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        createDebt: createDebtForOrder,
      });
      clearCart();
      setStatusMessage(`Order #${order.id} yaratildi.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!deliveryOrderId.trim() || !deliveryAddress.trim()) {
      setErrorMessage("Order ID va manzilni to'ldiring.");
      return;
    }

    setSubmittingDelivery(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const delivery: Delivery = await createDelivery({
        orderId: Number(deliveryOrderId),
        address: deliveryAddress.trim(),
      });
      setStatusMessage(`Delivery #${delivery.id} yaratildi.`);
      setDeliveryOrderId("");
      setDeliveryAddress("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingDelivery(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <PageSection title="Cart and checkout" subtitle="Create order API">
        {items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-lg font-semibold text-slate-950">{item.product.name}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {formatPrice(item.product.price)} x {item.quantity}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-full border border-slate-200 bg-white p-1">
                    <button className="h-9 w-9 rounded-full text-lg" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      -
                    </button>
                    <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                    <button className="h-9 w-9 rounded-full text-lg" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button className="text-sm font-semibold text-rose-600" onClick={() => removeFromCart(item.product.id)}>
                    Olib tashlash
                  </button>
                </div>
              </div>
            ))}

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Jami</span>
                <span className="text-2xl font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                  disabled={submittingOrder}
                  onClick={() => void handleCheckout(false)}
                >
                  {submittingOrder ? "Yuborilmoqda..." : "Debt'siz checkout"}
                </button>
                <button
                  className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                  disabled={submittingOrder}
                  onClick={() => void handleCheckout(true)}
                >
                  {submittingOrder ? "Yuborilmoqda..." : "Debt bilan checkout"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="Savat bo'sh" description="Checkout qilish uchun mahsulot qo'shing." />
        )}
      </PageSection>

      <PageSection title="Delivery request" subtitle="Create delivery API">
        <div className="grid gap-4">
          <input
            className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-300"
            value={deliveryOrderId}
            onChange={(event) => setDeliveryOrderId(event.target.value.replace(/\D/g, ""))}
            placeholder="Order ID"
          />
          <textarea
            className="min-h-28 rounded-[20px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-300"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="Yetkazib berish manzili"
          />
          <button
            className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
            disabled={submittingDelivery}
            onClick={() => void handleCreateDelivery()}
          >
            {submittingDelivery ? "Yuborilmoqda..." : "Delivery yaratish"}
          </button>
        </div>
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
