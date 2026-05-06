import { useState } from "react";
import { createDebt, createPayment, getApiErrorMessage, getPayments } from "@/features/app/api";
import { Button } from "@/shared/ui/Button";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { formatDate } from "@/shared/utils/format";

export function AdminFinancePage() {
  const [debtUserId, setDebtUserId] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [paymentDebtId, setPaymentDebtId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentsPreview, setPaymentsPreview] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      const payment = await createPayment({ debtId: Number(paymentDebtId), amount: Number(paymentAmount) });
      setPaymentDebtId("");
      setPaymentAmount("");
      setStatusMessage(`Payment #${payment.id} yaratildi.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handlePaymentHistory = async () => {
    if (!paymentDebtId) {
      setErrorMessage("Debt ID kiriting.");
      return;
    }

    setBusy("history");
    setErrorMessage(null);
    try {
      const payments = await getPayments(Number(paymentDebtId));
      setPaymentsPreview(
        payments.map((payment) => `${formatDate(payment.createdAt)} - ${formatPrice(payment.amount)}`).join("\n"),
      );
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <PageSection title="Manual debt" subtitle="POST debt API">
        <div className="grid gap-4">
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={debtUserId} onChange={(event) => setDebtUserId(event.target.value.replace(/\D/g, ""))} placeholder="User ID" />
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={debtAmount} onChange={(event) => setDebtAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="Amount" />
          <Button disabled={busy === "debt"} onClick={() => void handleCreateDebt()}>
            Debt yaratish
          </Button>
        </div>
      </PageSection>

      <PageSection title="Manual payment" subtitle="Payment APIs">
        <div className="grid gap-4">
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={paymentDebtId} onChange={(event) => setPaymentDebtId(event.target.value.replace(/\D/g, ""))} placeholder="Debt ID" />
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="Amount" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={busy === "payment"} onClick={() => void handleCreatePayment()}>
              Payment yaratish
            </Button>
            <Button variant="secondary" disabled={busy === "history"} onClick={() => void handlePaymentHistory()}>
              History olish
            </Button>
          </div>
          {paymentsPreview ? (
            <textarea readOnly className="min-h-28 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600" value={paymentsPreview} />
          ) : null}
        </div>
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
