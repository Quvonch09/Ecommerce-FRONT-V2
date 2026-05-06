import { useEffect, useState } from "react";
import type { DashboardSummary } from "@/entities/dashboard/model";
import type { Stock } from "@/entities/stock/model";
import { getApiErrorMessage, getDashboard, getStock, updateStock } from "@/features/app/api";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { tone } from "@/shared/utils/format";

export function AdminStockPage() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<number, { quantity: string; minThreshold: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [nextStock, nextDashboard] = await Promise.all([getStock(), getDashboard().catch(() => null)]);
      setStock(nextStock);
      setDashboard(nextDashboard);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveStock = async (productId: number, currentQuantity: number, currentThreshold?: number) => {
    const draft = stockDrafts[productId];
    const quantity = draft?.quantity ?? String(currentQuantity);
    const minThreshold = draft?.minThreshold ?? String(currentThreshold ?? 0);

    if (!quantity) {
      setErrorMessage("Stock quantity kiriting.");
      return;
    }

    setBusy(`stock-${productId}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await updateStock(productId, {
        quantity: Number(quantity),
        minThreshold: minThreshold ? Number(minThreshold) : undefined,
      });
      setStatusMessage(`Stock #${productId} yangilandi.`);
      await loadData();
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
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <PageSection title="Stock" subtitle="Warehouse stock API">
        {stock.length ? (
          <div className="space-y-4">
            {stock.map((item) => (
              <article key={item.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{item.productName}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(item.lowStock ? "CANCELLED" : "DELIVERED")}`}>
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
                            minThreshold: current[item.productId]?.minThreshold ?? String(item.minThreshold ?? 0),
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
                    <Button disabled={busy === `stock-${item.productId}`} onClick={() => void handleSaveStock(item.productId, item.quantity, item.minThreshold)}>
                      Save
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Stock yo'q" description="Stock API bo'sh natija qaytardi." />
        )}
      </PageSection>

      <PageSection title="Low stock alerts" subtitle="Dashboard stock signal">
        {dashboard?.lowStockProducts?.length ? (
          <div className="space-y-3">
            {dashboard.lowStockProducts.map((item) => (
              <div key={item.id} className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {item.productName}: {item.quantity} dona qoldi, threshold {item.minThreshold ?? 0}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Alert yo'q" description="Low stock mahsulotlar hozircha aniqlanmadi." />
        )}
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
