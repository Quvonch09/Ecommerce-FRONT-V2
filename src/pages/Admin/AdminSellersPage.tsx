import { useEffect, useState } from "react";
import type { User } from "@/entities/user/model";
import { createSeller, getAllUsers, getApiErrorMessage, getSellers } from "@/features/app/api";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { tone } from "@/shared/utils/format";

const initialSeller = {
  telegramId: "",
  phoneNumber: "",
  password: "",
  firstName: "",
  lastName: "",
  username: "",
};

export function AdminSellersPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === "ROLE_ADMIN");
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [sellerForm, setSellerForm] = useState(initialSeller);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      const [nextUsers, nextSellers] = await Promise.all([getAllUsers(), getSellers()]);
      setUsers(nextUsers);
      setSellers(nextSellers);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [isAdmin]);

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

  if (!isAdmin) {
    return <EmptyState title="Admin only" description="Sellers bo'limi faqat ROLE_ADMIN uchun ochiq." />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <PageSection title="Users and sellers" subtitle="Admin user APIs">
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
      </PageSection>

      <PageSection title="Create seller" subtitle="POST seller API">
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
              onChange={(event) => setSellerForm((current) => ({ ...current, [key]: event.target.value }))}
              placeholder={label}
            />
          ))}
          <Button disabled={busy === "seller"} onClick={() => void handleCreateSeller()}>
            {busy === "seller" ? "Yaratilmoqda..." : "Seller yaratish"}
          </Button>
        </div>
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
