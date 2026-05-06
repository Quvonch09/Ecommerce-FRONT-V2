import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Debt } from "@/entities/debt/model";
import type { Delivery } from "@/entities/delivery/model";
import type { Order } from "@/entities/order/model";
import type { Payment } from "@/entities/payment/model";
import type { Product } from "@/entities/product/model";
import { useAuthStore } from "@/features/auth/store";
import {
  createDelivery,
  createOrder,
  createPayment,
  getApiErrorMessage,
  getMyDebts,
  getMyOrders,
  getPayments,
  getProductById,
  getProducts,
} from "@/features/app/api";
import { useCartStore } from "@/features/cart/store";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { formatPrice } from "@/shared/utils/currency";

function formatDate(value?: string) {
  if (!value) {
    return "Noma'lum sana";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusTone(value: string) {
  const map: Record<string, string> = {
    NEW: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-sky-100 text-sky-800",
    DELIVERED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-rose-100 text-rose-800",
    OPEN: "bg-orange-100 text-orange-800",
    CLOSED: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-slate-200 text-slate-700",
    ON_THE_WAY: "bg-violet-100 text-violet-800",
  };

  return map[value] ?? "bg-slate-100 text-slate-700";
}

function Section({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="animate-rise rounded-[32px] border border-white/80 bg-white/88 p-5 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
            {subtitle}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
        </div>
        {actions}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ClientPage() {
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [paymentsByDebt, setPaymentsByDebt] = useState<Record<number, Payment[]>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState<number | null>(null);
  const [deliveryOrderId, setDeliveryOrderId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentDrafts, setPaymentDrafts] = useState<Record<number, string>>({});

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const loadClientData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [nextProducts, nextOrders, nextDebts] = await Promise.all([
        getProducts(),
        getMyOrders(),
        getMyDebts(),
      ]);

      setProducts(nextProducts);
      setOrders(nextOrders);
      setDebts(nextDebts);

      if (nextProducts.length) {
        const fullProduct = await getProductById(nextProducts[0].id);
        setSelectedProduct(fullProduct);
      } else {
        setSelectedProduct(null);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClientData();
  }, []);

  const handleProductSelect = async (productId: number) => {
    try {
      const product = await getProductById(productId);
      setSelectedProduct(product);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

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
      await loadClientData();
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

  const handleOpenPayments = async (debtId: number) => {
    setErrorMessage(null);

    try {
      const payments = await getPayments(debtId);
      setPaymentsByDebt((current) => ({ ...current, [debtId]: payments }));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const handlePayDebt = async (debtId: number) => {
    const amount = Number(paymentDrafts[debtId] ?? 0);

    if (!amount || amount <= 0) {
      setErrorMessage("To'lov summasini kiriting.");
      return;
    }

    setSubmittingPayment(debtId);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await createPayment({ debtId, amount });
      setPaymentDrafts((current) => ({ ...current, [debtId]: "" }));
      setStatusMessage(`Debt #${debtId} uchun to'lov yozildi.`);
      await Promise.all([loadClientData(), handleOpenPayments(debtId)]);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingPayment(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Section
          title={`Assalomu alaykum, ${user?.firstName ?? "foydalanuvchi"}`}
          subtitle="Live catalog"
          actions={
            <Button variant="secondary" onClick={() => void loadClientData()}>
              Refresh data
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50"
              >
                <button
                  className="block w-full text-left"
                  onClick={() => void handleProductSelect(product.id)}
                >
                  <div className="aspect-[4/3] bg-[linear-gradient(135deg,_#fed7aa,_#e0f2fe)]">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                        Rasm mavjud emas
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-semibold text-slate-950">{product.name}</div>
                    <div className="mt-2 min-h-10 text-sm leading-6 text-slate-600">
                      {product.description || "Mahsulot tavsifi kiritilmagan."}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-base font-semibold text-slate-950">
                        {formatPrice(product.price)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {product.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="border-t border-slate-200 p-4">
                  <Button fullWidth onClick={() => addToCart(product)}>
                    Savatga qo'shish
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Selected product" subtitle="Detail API">
          {selectedProduct ? (
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] p-1">
                <div className="overflow-hidden rounded-[26px] bg-white">
                  <div className="aspect-[4/3] bg-slate-100">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-950">
                          {selectedProduct.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedProduct.description || "Tavsif mavjud emas."}
                        </p>
                      </div>
                      <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                        {formatPrice(selectedProduct.price)}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                      Yaratilgan vaqt: {formatDate(selectedProduct.createdAt)}
                    </div>
                    <Button className="mt-5" fullWidth onClick={() => addToCart(selectedProduct)}>
                      Shu mahsulotni buyurtma qilish
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Mahsulot topilmadi"
              description="Backend mahsulot qaytarmadi yoki tanlangan item yo'q."
            />
          )}
        </Section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="Cart and checkout" subtitle="Create order API">
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
                      <button
                        className="h-9 w-9 rounded-full text-lg"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                      <button
                        className="h-9 w-9 rounded-full text-lg"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="text-sm font-semibold text-rose-600"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      Olib tashlash
                    </button>
                  </div>
                </div>
              ))}

              <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Jami</span>
                  <span className="text-2xl font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Button
                    fullWidth
                    disabled={submittingOrder}
                    onClick={() => void handleCheckout(false)}
                  >
                    {submittingOrder ? "Yuborilmoqda..." : "Debt'siz checkout"}
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    disabled={submittingOrder}
                    onClick={() => void handleCheckout(true)}
                  >
                    {submittingOrder ? "Yuborilmoqda..." : "Debt bilan checkout"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Savat bo'sh"
              description="Checkout qilish uchun kamida bitta mahsulot qo'shing."
            />
          )}
        </Section>

        <Section title="Delivery request" subtitle="Create delivery API">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Order ID</span>
              <input
                className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-300"
                value={deliveryOrderId}
                onChange={(event) => setDeliveryOrderId(event.target.value.replace(/\D/g, ""))}
                placeholder="Masalan: 12"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">Yetkazib berish manzili</span>
              <textarea
                className="min-h-28 rounded-[20px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-300"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                placeholder="Toshkent, Yunusobod..."
              />
            </label>
            <Button disabled={submittingDelivery} onClick={() => void handleCreateDelivery()}>
              {submittingDelivery ? "Yuborilmoqda..." : "Delivery yaratish"}
            </Button>
          </div>
        </Section>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Section title="My orders" subtitle="Order history API">
          {orders.length ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">Order #{order.id}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-base font-semibold text-slate-950">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm"
                      >
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
            <EmptyState
              title="Order topilmadi"
              description="Hali ushbu akkaunt orqali order yaratilmagan."
            />
          )}
        </Section>

        <Section title="My debts and payments" subtitle="Debt and payment APIs">
          {debts.length ? (
            <div className="space-y-4">
              {debts.map((debt) => (
                <article
                  key={debt.id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">Debt #{debt.id}</div>
                      <div className="mt-1 text-sm text-slate-500">{formatDate(debt.createdAt)}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(debt.status)}`}>
                      {debt.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Jami qarz</div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">
                        {formatPrice(debt.totalAmount)}
                      </div>
                    </div>
                    <div className="rounded-[20px] bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">To'langan</div>
                      <div className="mt-2 text-xl font-semibold text-slate-950">
                        {formatPrice(debt.paidAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <input
                      className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-orange-300"
                      value={paymentDrafts[debt.id] ?? ""}
                      onChange={(event) =>
                        setPaymentDrafts((current) => ({
                          ...current,
                          [debt.id]: event.target.value.replace(/[^\d.]/g, ""),
                        }))
                      }
                      placeholder="To'lov summasi"
                    />
                    <Button
                      variant="secondary"
                      onClick={() => void handleOpenPayments(debt.id)}
                    >
                      History
                    </Button>
                    <Button
                      disabled={submittingPayment === debt.id}
                      onClick={() => void handlePayDebt(debt.id)}
                    >
                      {submittingPayment === debt.id ? "Yuborilmoqda..." : "To'lash"}
                    </Button>
                  </div>

                  {paymentsByDebt[debt.id]?.length ? (
                    <div className="mt-4 space-y-2">
                      {paymentsByDebt[debt.id].map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-slate-800">
                            Payment #{payment.id}
                          </span>
                          <span className="text-slate-500">
                            {formatPrice(payment.amount)} | {formatDate(payment.createdAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Qarz topilmadi"
              description="Siz uchun ochiq yoki yopilgan debt yozuvlari mavjud emas."
            />
          )}
        </Section>
      </section>

      {statusMessage ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
