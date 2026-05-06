import { useEffect, useState } from "react";
import type { DashboardSummary } from "@/entities/dashboard/model";
import { getApiErrorMessage, getDashboard } from "@/features/app/api";
import { useAuthStore } from "@/features/auth/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";

export function AdminDashboardPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === "ROLE_ADMIN");
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        setDashboard(await getDashboard());
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAdmin]);

  if (loading) {
    return <Loader />;
  }

  if (!isAdmin) {
    return (
      <EmptyState
        title="Admin only"
        description="Dashboard analytics faqat ROLE_ADMIN uchun ochiq."
      />
    );
  }

  if (!dashboard) {
    return <StatusNotice tone="error" message={errorMessage || "Dashboard yuklanmadi."} />;
  }

  return (
    <div className="grid gap-6">
      <PageSection title="Dashboard" subtitle="Admin analytics API">
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
              <Metric label="Revenue" value={formatPrice(dashboard.revenue)} />
              <Metric label="Profit" value={formatPrice(dashboard.estimatedProfit)} />
              <Metric label="Cost" value={formatPrice(dashboard.estimatedCost)} />
              <Metric label="Outstanding debt" value={formatPrice(dashboard.debtOutstanding)} />
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-950">Top products</div>
            <div className="mt-4 space-y-3">
              {dashboard.topProducts.length ? (
                dashboard.topProducts.map((product) => (
                  <div key={product.productId} className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3">
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
      </PageSection>

      <PageSection title="Low stock alerts" subtitle="Dashboard stock signal">
        {dashboard.lowStockProducts.length ? (
          <div className="space-y-3">
            {dashboard.lowStockProducts.map((item) => (
              <div key={item.id} className="rounded-[20px] bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {item.productName}: {item.quantity} dona qoldi, threshold {item.minThreshold ?? 0}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Alert yo'q" description="Low stock mahsulotlar aniqlanmadi." />
        )}
      </PageSection>

      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
