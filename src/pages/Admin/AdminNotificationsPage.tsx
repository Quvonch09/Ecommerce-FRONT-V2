import { useState } from "react";
import { getApiErrorMessage, sendDebtReminder, sendOpenApp } from "@/features/app/api";
import { useAuthStore } from "@/features/auth/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";

export function AdminNotificationsPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === "ROLE_ADMIN");
  const [openAppUserId, setOpenAppUserId] = useState("");
  const [reminderDebtId, setReminderDebtId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAdmin) {
    return <EmptyState title="Admin only" description="Telegram bot notify endpointlari faqat ROLE_ADMIN uchun ochiq." />;
  }

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

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <PageSection title="Mini app link" subtitle="Telegram bot API">
        <div className="grid gap-4">
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={openAppUserId} onChange={(event) => setOpenAppUserId(event.target.value.replace(/\D/g, ""))} placeholder="User ID for open-app" />
          <button className="rounded-[20px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={busy === "open-app"} onClick={() => void handleOpenApp()}>
            Mini app link yuborish
          </button>
        </div>
      </PageSection>

      <PageSection title="Debt reminder" subtitle="Telegram reminder API">
        <div className="grid gap-4">
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={reminderDebtId} onChange={(event) => setReminderDebtId(event.target.value.replace(/\D/g, ""))} placeholder="Debt ID for reminder" />
          <button className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950" disabled={busy === "reminder"} onClick={() => void handleDebtReminder()}>
            Debt reminder yuborish
          </button>
        </div>
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
