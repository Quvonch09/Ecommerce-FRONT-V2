export function formatDate(value?: string) {
  if (!value) {
    return "Noma'lum sana";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function tone(value: string) {
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
    Active: "bg-emerald-100 text-emerald-700",
    Inactive: "bg-rose-100 text-rose-700",
  };

  return map[value] ?? "bg-slate-100 text-slate-700";
}
