import { useEffect, useState } from "react";
import type { Product } from "@/entities/product/model";
import { getProducts } from "@/features/product/api";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { ProductCard } from "@/widgets/ProductCard/ProductCard";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError("Unable to load products from the live backend.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <EmptyState title="Products unavailable" description={error} />;
  }

  return (
    <section>
      <div className="animate-rise">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">Catalog</p>
        <h1 className="mt-2 text-3xl font-semibold text-tg-text">Choose your next order</h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-tg-hint">
          Live products from the Spring Boot backend, tuned for Telegram’s compact mobile view.
        </p>
      </div>

      {products.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="No active products"
            description="The backend returned an empty active product list."
          />
        </div>
      )}
    </section>
  );
}
