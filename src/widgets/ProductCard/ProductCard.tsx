import { Link } from "react-router-dom";
import type { Product } from "@/entities/product/model";
import { useCartStore } from "@/features/cart/store";
import { Button } from "@/shared/ui/Button";
import { formatPrice } from "@/shared/utils/currency";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <article className="animate-rise overflow-hidden rounded-[28px] bg-white p-3 shadow-soft">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>
        <div className="pt-4">
          <h3 className="line-clamp-2 text-sm font-semibold text-tg-text">{product.name}</h3>
          <p className="mt-2 text-base font-bold text-tg-text">{formatPrice(product.price)}</p>
        </div>
      </Link>

      <Button fullWidth className="mt-4" onClick={() => addToCart(product)}>
        Add to cart
      </Button>
    </article>
  );
}
