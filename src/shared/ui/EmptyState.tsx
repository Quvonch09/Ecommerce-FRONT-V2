import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="animate-rise rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-soft">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#fdba74,_#bfdbfe)] text-xl font-bold text-slate-950">
        +
      </div>
      <h3 className="text-lg font-semibold text-tg-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-tg-hint">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
