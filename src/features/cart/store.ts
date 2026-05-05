import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/entities/product/model";
import { STORAGE_KEYS } from "@/shared/constants/config";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const current = get().items;
        const existing = current.find((item) => item.product.id === product.id);

        if (existing) {
          set({
            items: current.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          });
          return;
        }

        set({ items: [...current, { product, quantity: 1 }] });
      },
      removeFromCart: (productId) =>
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        }),
      updateQuantity: (productId, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((item) => item.product.id !== productId)
              : get().items.map((item) =>
                  item.product.id === productId ? { ...item, quantity } : item,
                ),
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: STORAGE_KEYS.cart,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
