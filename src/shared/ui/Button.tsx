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
        "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        {
          "bg-tg-accent text-tg-accentText shadow-soft": variant === "primary",
          "bg-white text-tg-text shadow-soft": variant === "secondary",
          "bg-transparent text-tg-text": variant === "ghost",
          "bg-rose-500 text-white shadow-soft": variant === "danger",
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
