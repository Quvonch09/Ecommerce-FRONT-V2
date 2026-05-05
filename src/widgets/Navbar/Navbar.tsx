import { NavLink } from "react-router-dom";
import { useCartStore } from "@/features/cart/store";
import clsx from "clsx";

const items = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/cart", label: "Cart", icon: "◔" },
  { to: "/profile", label: "Profile", icon: "◎" },
];

export function Navbar() {
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <nav className="safe-bottom sticky bottom-0 border-t border-tg-stroke bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "relative flex flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium transition",
                isActive ? "bg-sky-50 text-sky-600" : "text-tg-hint",
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="mt-1">{item.label}</span>
            {item.to === "/cart" && count > 0 ? (
              <span className="absolute right-4 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-tg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
