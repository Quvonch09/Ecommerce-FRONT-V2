import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Product } from "@/entities/product/model";
import { useCartStore } from "@/features/cart/store";
import { getProductById } from "@/features/product/api";
import { Button } from "@/shared/ui/Button";
import { Loader } from "@/shared/ui/Loader";
import { formatPrice } from "@/shared/utils/currency";

export function ProductPage() {
  const { productId = "" } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <p className="text-lg font-semibold">Product not found</p>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky-600">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <section className="animate-rise">
      <div className="overflow-hidden rounded-[32px] bg-white shadow-soft">
        <div className="aspect-square bg-slate-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image
            </div>
          )}
        </div>

        <div className="p-5">
          <Link to="/" className="text-sm font-semibold text-sky-600">
            ← Back
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-tg-text">{product.name}</h1>
          <p className="mt-3 text-sm leading-6 text-tg-hint">
            {product.description || "This product currently has no public description."}
          </p>
          <div className="mt-5 text-2xl font-bold text-tg-text">{formatPrice(product.price)}</div>
          <Button fullWidth className="mt-6" onClick={() => addToCart(product)}>
            Add to cart
          </Button>
        </div>
      </div>
    </section>
  );
}
