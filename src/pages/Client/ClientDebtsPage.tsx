import { useEffect, useState } from "react";
import type { Debt } from "@/entities/debt/model";
import type { Payment } from "@/entities/payment/model";
import { createPayment, getApiErrorMessage, getMyDebts, getPayments } from "@/features/app/api";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { formatDate, tone } from "@/shared/utils/format";

export function ClientDebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [paymentsByDebt, setPaymentsByDebt] = useState<Record<number, Payment[]>>({});
  const [paymentDrafts, setPaymentDrafts] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submittingPayment, setSubmittingPayment] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setDebts(await getMyDebts());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenPayments = async (debtId: number) => {
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
      await loadData();
      await handleOpenPayments(debtId);
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
      <PageSection title="My debts and payments" subtitle="Debt and payment APIs">
        {debts.length ? (
          <div className="space-y-4">
            {debts.map((debt) => (
              <article key={debt.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-950">Debt #{debt.id}</div>
                    <div className="mt-1 text-sm text-slate-500">{formatDate(debt.createdAt)}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(debt.status)}`}>
                    {debt.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Jami qarz</div>
                    <div className="mt-2 text-xl font-semibold text-slate-950">{formatPrice(debt.totalAmount)}</div>
                  </div>
                  <div className="rounded-[20px] bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-400">To'langan</div>
                    <div className="mt-2 text-xl font-semibold text-slate-950">{formatPrice(debt.paidAmount)}</div>
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
                  <button
                    className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                    onClick={() => void handleOpenPayments(debt.id)}
                  >
                    History
                  </button>
                  <button
                    className="rounded-[20px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    disabled={submittingPayment === debt.id}
                    onClick={() => void handlePayDebt(debt.id)}
                  >
                    {submittingPayment === debt.id ? "Yuborilmoqda..." : "To'lash"}
                  </button>
                </div>

                {paymentsByDebt[debt.id]?.length ? (
                  <div className="mt-4 space-y-2">
                    {paymentsByDebt[debt.id].map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-[18px] bg-white px-4 py-3 text-sm">
                        <span className="font-medium text-slate-800">Payment #{payment.id}</span>
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
          <EmptyState title="Qarz topilmadi" description="Siz uchun debt yozuvlari mavjud emas." />
        )}
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
