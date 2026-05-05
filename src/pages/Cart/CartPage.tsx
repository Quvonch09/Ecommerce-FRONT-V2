import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/features/cart/store";
import { createOrder } from "@/features/order/api";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatPrice } from "@/shared/utils/currency";

export function CartPage() {
  const { items, clearCart, removeFromCart, updateQuantity } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      const order = await createOrder(items);
      clearCart();
      setMessage(`Order #${order.id} created successfully.`);
    } catch {
      setMessage("Checkout failed. Please verify stock and backend availability.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <EmptyState
        title="Cart is empty"
        description="Add products from the catalog before creating an order."
        action={
          <Link to="/">
            <Button>Go to catalog</Button>
          </Link>
        }
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="animate-rise">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Cart</p>
        <h1 className="mt-2 text-3xl font-semibold text-tg-text">Review your order</h1>
      </div>

      {items.map((item) => (
        <article
          key={item.product.id}
          className="animate-rise rounded-[28px] bg-white p-4 shadow-soft"
        >
          <div className="flex gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-tg-text">{item.product.name}</h3>
              <p className="mt-2 text-sm text-tg-hint">{formatPrice(item.product.price)}</p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                  <button
                    className="h-8 w-8 rounded-full bg-white text-lg"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    className="h-8 w-8 rounded-full bg-white text-lg"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="text-sm font-semibold text-rose-500"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}

      <div className="animate-rise rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tg-hint">Total</span>
          <span className="text-2xl font-bold text-tg-text">{formatPrice(total)}</span>
        </div>
        <Button fullWidth className="mt-5" disabled={submitting} onClick={handleCheckout}>
          {submitting ? "Creating order..." : "Checkout"}
        </Button>
        {message ? <p className="mt-3 text-sm text-tg-hint">{message}</p> : null}
      </div>
    </section>
  );
}
