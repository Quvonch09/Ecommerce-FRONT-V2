import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-[28px] bg-white p-6 text-center shadow-soft animate-rise">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl">
        ○
      </div>
      <h3 className="text-lg font-semibold text-tg-text">{title}</h3>
      <p className="mt-2 text-sm text-tg-hint">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
