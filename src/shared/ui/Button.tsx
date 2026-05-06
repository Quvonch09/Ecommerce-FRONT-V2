import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-[20px] px-4 py-3 text-sm font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-white text-slate-950 shadow-soft hover:bg-slate-50":
            variant === "primary" || variant === "secondary",
          "bg-transparent text-slate-950 hover:bg-slate-100": variant === "ghost",
          "bg-rose-500 text-white shadow-soft hover:bg-rose-600": variant === "danger",
          "w-full": fullWidth,
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
