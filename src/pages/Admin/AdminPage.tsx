import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { DashboardSummary } from "@/entities/dashboard/model";
import type { DeliveryStatus } from "@/entities/delivery/model";
import type { Order, OrderStatus } from "@/entities/order/model";
import type { Product } from "@/entities/product/model";
import type { Stock } from "@/entities/stock/model";
import type { User } from "@/entities/user/model";
import { useAuthStore } from "@/features/auth/store";
import {
  createDebt,
  createPayment,
  createProduct,
  createSeller,
  getAllOrders,
  getAllUsers,
  getApiErrorMessage,
  getDashboard,
  getOrder,
  getPayments,
  getProducts,
  getSellers,
  getStock,
  sendDebtReminder,
  sendOpenApp,
  updateDeliveryStatus,
  updateOrderStatus,
  updateProduct,
  updateStock,
  deleteProduct,
} from "@/features/app/api";
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

function tone(value: string) {
  const map: Record<string, string> = {
    ROLE_ADMIN: "bg-slate-950 text-white",
    ROLE_SELLER: "bg-sky-100 text-sky-800",
    ROLE_USER: "bg-orange-100 text-orange-800",
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
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
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

const initialProduct = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  imageUrl: "",
  isActive: true,
};

const initialSeller = {
  telegramId: "",
  phoneNumber: "",
  password: "",
  firstName: "",
  lastName: "",
  username: "",
};

export function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ROLE_ADMIN";

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentsByDebt, setPaymentsByDebt] = useState<Record<number, string>>({});
  const [deliveryDrafts, setDeliveryDrafts] = useState<Record<number, DeliveryStatus>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<number, { quantity: string; minThreshold: string }>>({});
  const [orderStatusDrafts, setOrderStatusDrafts] = useState<Record<number, OrderStatus>>({});
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState(initialProduct);
  const [sellerForm, setSellerForm] = useState(initialSeller);
  const [debtUserId, setDebtUserId] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [paymentDebtId, setPaymentDebtId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [openAppUserId, setOpenAppUserId] = useState("");
  const [reminderDebtId, setReminderDebtId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isAdmin) {
        const [nextProducts, nextStock, nextOrders, nextDashboard, nextUsers, nextSellers] =
          await Promise.all([
            getProducts(),
            getStock(),
            getAllOrders(),
            getDashboard(),
            getAllUsers(),
            getSellers(),
          ]);

        setProducts(nextProducts);
        setStock(nextStock);
        setOrders(nextOrders);
        setDashboard(nextDashboard);
        setUsers(nextUsers);
        setSellers(nextSellers);
      } else {
        const [nextProducts, nextStock, nextOrders] = await Promise.all([
          getProducts(),
          getStock(),
          getAllOrders(),
        ]);

        setProducts(nextProducts);
        setStock(nextStock);
        setOrders(nextOrders);
        setDashboard(null);
        setUsers([]);
        setSellers([]);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
  }, [isAdmin]);

  const beginProductEdit = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price ?? ""),
      costPrice: String(product.costPrice ?? ""),
      imageUrl: product.imageUrl ?? "",
      isActive: product.isActive ?? true,
    });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(initialProduct);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price || !productForm.costPrice) {
      setErrorMessage("Mahsulot nomi, price va cost price majburiy.");
      return;
    }

    setBusy("product");
    setStatusMessage(null);
    setErrorMessage(null);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      costPrice: Number(productForm.costPrice),
      imageUrl: productForm.imageUrl.trim(),
      isActive: productForm.isActive,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setStatusMessage(`Product #${editingProductId} yangilandi.`);
      } else {
        const product = await createProduct(payload);
        setStatusMessage(`Product #${product.id} yaratildi.`);
      }
      resetProductForm();
      await loadAdminData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setBusy(`delete-${id}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await deleteProduct(id);
      setStatusMessage(`Product #${id} o'chirildi.`);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleSaveStock = async (productId: number) => {
    const draft = stockDrafts[productId];

    if (!draft?.quantity) {
      setErrorMessage("Stock quantity kiriting.");
      return;
    }

    setBusy(`stock-${productId}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await updateStock(productId, {
        quantity: Number(draft.quantity),
        minThreshold: draft.minThreshold ? Number(draft.minThreshold) : undefined,
      });
      setStatusMessage(`Stock #${productId} yangilandi.`);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleOrderDetail = async (id: number) => {
    setBusy(`order-${id}`);
    setErrorMessage(null);

    try {
      const order = await getOrder(id);
      setSelectedOrder(order);
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
      await loadAdminData();
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

  const handleCreateDebt = async () => {
    if (!debtUserId || !debtAmount) {
      setErrorMessage("Debt uchun user ID va amount kiriting.");
      return;
    }

    setBusy("debt");
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const debt = await createDebt({ userId: Number(debtUserId), totalAmount: Number(debtAmount) });
      setDebtUserId("");
      setDebtAmount("");
      setStatusMessage(`Debt #${debt.id} yaratildi.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentDebtId || !paymentAmount) {
      setErrorMessage("Payment uchun debt ID va amount kiriting.");
      return;
    }

    setBusy("payment");
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const payment = await createPayment({
        debtId: Number(paymentDebtId),
        amount: Number(paymentAmount),
      });
      setStatusMessage(`Payment #${payment.id} yaratildi.`);
      setPaymentDebtId("");
      setPaymentAmount("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handlePaymentHistory = async (debtId: number) => {
    setBusy(`payments-${debtId}`);
    setErrorMessage(null);

    try {
      const payments = await getPayments(debtId);
      setPaymentsByDebt((current) => ({
        ...current,
        [debtId]: payments
          .map((payment) => `${formatDate(payment.createdAt)} - ${formatPrice(payment.amount)}`)
          .join("\n"),
      }));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleCreateSeller = async () => {
    if (!sellerForm.telegramId || !sellerForm.phoneNumber || !sellerForm.password || !sellerForm.firstName) {
      setErrorMessage("Seller yaratish uchun majburiy maydonlarni to'ldiring.");
      return;
    }

    setBusy("seller");
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const seller = await createSeller({
        telegramId: Number(sellerForm.telegramId),
        phoneNumber: sellerForm.phoneNumber,
        password: sellerForm.password,
        firstName: sellerForm.firstName,
        lastName: sellerForm.lastName,
        username: sellerForm.username,
      });
      setSellerForm(initialSeller);
      setStatusMessage(`Seller #${seller.id} yaratildi.`);
      await loadAdminData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleOpenApp = async () => {
    if (!openAppUserId) {
      setErrorMessage("Foydalanuvchi ID kiriting.");
      return;
    }

    setBusy("open-app");
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const result = await sendOpenApp(Number(openAppUserId));
      setStatusMessage(result.text);
      setOpenAppUserId("");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleDebtReminder = async () => {
    if (!reminderDebtId) {
      setErrorMessage("Debt ID kiriting.");
      return;
    }

    setBusy("reminder");
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const result = await sendDebtReminder(Number(reminderDebtId));
      setStatusMessage(result.text);
      setReminderDebtId("");
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
    <div className="grid gap-6">
      {isAdmin && dashboard ? (
        <Section
          title="Dashboard"
          subtitle="Admin analytics API"
          actions={
            <Button variant="secondary" onClick={() => void loadAdminData()}>
              Refresh data
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Users", dashboard.totalUsers],
              ["Sellers", dashboard.totalSellers],
              ["Orders", dashboard.totalOrders],
              ["Products", dashboard.totalProducts],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[26px] bg-[linear-gradient(135deg,_#082f49,_#1d4ed8)] p-5 text-white"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</div>
                <div className="mt-3 text-3xl font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Revenue</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatPrice(dashboard.revenue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Profit</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatPrice(dashboard.estimatedProfit)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Cost</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatPrice(dashboard.estimatedCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Outstanding debt</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatPrice(dashboard.debtOutstanding)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Top products</div>
              <div className="mt-4 space-y-3">
                {dashboard.topProducts.length ? (
                  dashboard.topProducts.map((product) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3"
                    >
                      <span className="font-medium text-slate-900">{product.productName}</span>
                      <span className="text-sm text-slate-500">{product.soldQuantity} sold</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">Top products hali yo'q.</div>
                )}
              </div>
            </div>
          </div>
        </Section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="Products" subtitle="Product CRUD API">
          <div className="grid gap-4">
            {products.length ? (
              products.map((product) => (
                <article
                  key={product.id}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive === false ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {product.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {formatPrice(product.price)} | Cost {formatPrice(product.costPrice ?? 0)}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">{product.description}</div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="secondary" onClick={() => beginProductEdit(product)}>
                        Edit
                      </Button>
                      {isAdmin ? (
                        <Button
                          variant="danger"
                          disabled={busy === `delete-${product.id}`}
                          onClick={() => void handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Products yo'q"
                description="Backend products ro'yxati bo'sh."
              />
            )}
          </div>
        </Section>

        <Section title={editingProductId ? "Edit product" : "Create product"} subtitle="POST / PUT product">
          <div className="grid gap-4">
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={productForm.name}
              onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Product name"
            />
            <textarea
              className="min-h-28 rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={productForm.description}
              onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                value={productForm.price}
                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value.replace(/[^\d.]/g, "") }))}
                placeholder="Price"
              />
              <input
                className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                value={productForm.costPrice}
                onChange={(event) => setProductForm((current) => ({ ...current, costPrice: event.target.value.replace(/[^\d.]/g, "") }))}
                placeholder="Cost price"
              />
            </div>
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={productForm.imageUrl}
              onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
              placeholder="Image URL"
            />
            <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={productForm.isActive}
                onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              Active product
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={busy === "product"} onClick={() => void handleSaveProduct()}>
                {busy === "product" ? "Saqlanmoqda..." : editingProductId ? "Yangilash" : "Yaratish"}
              </Button>
              <Button variant="secondary" onClick={resetProductForm}>
                Tozalash
              </Button>
            </div>
          </div>
        </Section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="Stock" subtitle="Warehouse stock API">
          <div className="space-y-4">
            {stock.length ? (
              stock.map((item) => (
                <article key={item.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">{item.productName}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.lowStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {item.lowStock ? "Low stock" : "Healthy"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        Quantity: {item.quantity} | Threshold: {item.minThreshold ?? 0}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[140px_140px_auto]">
                      <input
                        className="rounded-[16px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                        value={stockDrafts[item.productId]?.quantity ?? String(item.quantity)}
                        onChange={(event) =>
                          setStockDrafts((current) => ({
                            ...current,
                            [item.productId]: {
                              quantity: event.target.value.replace(/\D/g, ""),
                              minThreshold:
                                current[item.productId]?.minThreshold ?? String(item.minThreshold ?? 0),
                            },
                          }))
                        }
                        placeholder="Quantity"
                      />
                      <input
                        className="rounded-[16px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                        value={stockDrafts[item.productId]?.minThreshold ?? String(item.minThreshold ?? 0)}
                        onChange={(event) =>
                          setStockDrafts((current) => ({
                            ...current,
                            [item.productId]: {
                              quantity: current[item.productId]?.quantity ?? String(item.quantity),
                              minThreshold: event.target.value.replace(/\D/g, ""),
                            },
                          }))
                        }
                        placeholder="Threshold"
                      />
                      <Button
                        disabled={busy === `stock-${item.productId}`}
                        onClick={() => void handleSaveStock(item.productId)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="Stock yo'q" description="Stock API bo'sh natija qaytardi." />
            )}
          </div>
        </Section>

        <Section title="Low stock alerts" subtitle="Dashboard stock signal">
          {dashboard?.lowStockProducts?.length ? (
            <div className="space-y-3">
              {dashboard.lowStockProducts.map((item) => (
                <div key={item.id} className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {item.productName}: {item.quantity} dona qoldi, threshold {item.minThreshold ?? 0}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Alert yo'q"
              description="Low stock mahsulotlar hozircha aniqlanmadi."
            />
          )}
        </Section>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Section title="Orders" subtitle="Admin order APIs">
          <div className="space-y-4">
            {orders.length ? (
              orders.map((order) => (
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
                      <select
                        className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                        value={orderStatusDrafts[order.id] ?? order.status}
                        onChange={(event) =>
                          setOrderStatusDrafts((current) => ({
                            ...current,
                            [order.id]: event.target.value as OrderStatus,
                          }))
                        }
                      >
                        {["NEW", "CONFIRMED", "DELIVERED", "CANCELLED"].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <Button
                        disabled={busy === `status-${order.id}`}
                        onClick={() => void handleOrderStatus(order.id)}
                      >
                        Status
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={busy === `order-${order.id}`}
                        onClick={() => void handleOrderDetail(order.id)}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[180px_auto]">
                    <select
                      className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 outline-none focus:border-sky-300"
                      value={deliveryDrafts[order.id] ?? "PENDING"}
                      onChange={(event) =>
                        setDeliveryDrafts((current) => ({
                          ...current,
                          [order.id]: event.target.value as DeliveryStatus,
                        }))
                      }
                    >
                      {["PENDING", "ON_THE_WAY", "DELIVERED"].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      disabled={busy === `delivery-${order.id}`}
                      onClick={() => void handleDeliveryStatus(order.id)}
                    >
                      Delivery status yangilash
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState title="Order yo'q" description="Admin orders API bo'sh." />
            )}
          </div>
        </Section>

        <Section title="Selected order" subtitle="GET single order API">
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="rounded-[22px] bg-slate-950 p-5 text-white">
                <div className="text-sm text-white/60">Order #{selectedOrder.id}</div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatPrice(selectedOrder.totalAmount)}
                </div>
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
            <EmptyState
              title="Order tanlanmagan"
              description="Order detail ko'rish uchun listdagi Detail tugmasini bosing."
            />
          )}
        </Section>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Section title="Users and sellers" subtitle="Admin user APIs">
            <div className="space-y-4">
              {users.map((item) => (
                <div key={item.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">
                        {item.firstName} {item.lastName}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        @{item.username || "no_username"} | +{item.phoneNumber || "n/a"}
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(item.role)}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-950">Current sellers</div>
                <div className="mt-3 space-y-2">
                  {sellers.map((seller) => (
                    <div key={seller.id} className="rounded-[16px] bg-white px-4 py-3 text-sm text-slate-700">
                      {seller.firstName} {seller.lastName} | {seller.telegramId}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Create seller" subtitle="POST seller API">
            <div className="grid gap-4">
              {[
                ["telegramId", "Telegram ID"],
                ["phoneNumber", "Phone number"],
                ["password", "Password"],
                ["firstName", "First name"],
                ["lastName", "Last name"],
                ["username", "Username"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                  value={sellerForm[key as keyof typeof sellerForm]}
                  onChange={(event) =>
                    setSellerForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                  placeholder={label}
                />
              ))}
              <Button disabled={busy === "seller"} onClick={() => void handleCreateSeller()}>
                {busy === "seller" ? "Yaratilmoqda..." : "Seller yaratish"}
              </Button>
            </div>
          </Section>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-3">
        <Section title="Manual debt" subtitle="POST debt API">
          <div className="grid gap-4">
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={debtUserId}
              onChange={(event) => setDebtUserId(event.target.value.replace(/\D/g, ""))}
              placeholder="User ID"
            />
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={debtAmount}
              onChange={(event) => setDebtAmount(event.target.value.replace(/[^\d.]/g, ""))}
              placeholder="Amount"
            />
            <Button disabled={busy === "debt"} onClick={() => void handleCreateDebt()}>
              Debt yaratish
            </Button>
          </div>
        </Section>

        <Section title="Manual payment" subtitle="Payment APIs">
          <div className="grid gap-4">
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={paymentDebtId}
              onChange={(event) => setPaymentDebtId(event.target.value.replace(/\D/g, ""))}
              placeholder="Debt ID"
            />
            <input
              className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value.replace(/[^\d.]/g, ""))}
              placeholder="Amount"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={busy === "payment"} onClick={() => void handleCreatePayment()}>
                Payment yaratish
              </Button>
              <Button
                variant="secondary"
                disabled={busy === `payments-${Number(paymentDebtId)}`}
                onClick={() => paymentDebtId && void handlePaymentHistory(Number(paymentDebtId))}
              >
                History olish
              </Button>
            </div>
            {paymentDebtId && paymentsByDebt[Number(paymentDebtId)] ? (
              <textarea
                readOnly
                className="min-h-28 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                value={paymentsByDebt[Number(paymentDebtId)]}
              />
            ) : null}
          </div>
        </Section>

        <Section title="Telegram bot" subtitle="Admin notify APIs">
          {isAdmin ? (
            <div className="grid gap-4">
              <input
                className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                value={openAppUserId}
                onChange={(event) => setOpenAppUserId(event.target.value.replace(/\D/g, ""))}
                placeholder="User ID for open-app"
              />
              <Button disabled={busy === "open-app"} onClick={() => void handleOpenApp()}>
                Mini app link yuborish
              </Button>
              <input
                className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300"
                value={reminderDebtId}
                onChange={(event) => setReminderDebtId(event.target.value.replace(/\D/g, ""))}
                placeholder="Debt ID for reminder"
              />
              <Button variant="secondary" disabled={busy === "reminder"} onClick={() => void handleDebtReminder()}>
                Debt reminder yuborish
              </Button>
            </div>
          ) : (
            <EmptyState
              title="Admin only"
              description="Telegram bot notify endpointlari faqat ROLE_ADMIN uchun ochiq."
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
