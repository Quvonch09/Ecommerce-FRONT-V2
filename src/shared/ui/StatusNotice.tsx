type Props = {
  tone?: "success" | "error";
  message: string;
};

export function StatusNotice({ tone = "success", message }: Props) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800"
          : "rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800"
      }
    >
      {message}
    </div>
  );
}
