import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/shared/ui/Button";
import { PageSection } from "@/shared/ui/PageSection";
import { formatDate, tone } from "@/shared/utils/format";

type Props = {
  title: string;
  subtitle: string;
};

export function ProfilePage({ title, subtitle }: Props) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <PageSection title={title} subtitle={subtitle}>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] bg-slate-950 p-6 text-white">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/10 text-2xl font-semibold">
            {(user?.firstName?.[0] || "U").toUpperCase()}
          </div>
          <h3 className="mt-5 text-3xl font-semibold">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="mt-2 text-sm text-white/70">@{user?.username || "no_username"}</p>
          <div className="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <span className={`rounded-full px-3 py-1 ${tone(user?.role || "ROLE_USER")}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Telegram ID</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">{user?.telegramId}</div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {user?.phoneNumber || "Kiritilmagan"}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Created</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {formatDate(user?.createdAt)}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Role access</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">{user?.role}</div>
          </div>

          <div className="md:col-span-2">
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
