import { useEffect, useState } from "react";
import type { Product } from "@/entities/product/model";
import { getApiErrorMessage, getProductById, getProducts } from "@/features/app/api";
import { useAuthStore } from "@/features/auth/store";
import { useCartStore } from "@/features/cart/store";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { formatDate, tone } from "@/shared/utils/format";

export function ClientCatalogPage() {
  const user = useAuthStore((state) => state.user);
  const addToCart = useCartStore((state) => state.addToCart);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextProducts = await getProducts();
      setProducts(nextProducts);
      setSelectedProduct(nextProducts.length ? await getProductById(nextProducts[0].id) : null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleProductSelect = async (productId: number) => {
    try {
      setSelectedProduct(await getProductById(productId));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid gap-6">
      <PageSection
        title={`Assalomu alaykum, ${user?.firstName ?? "foydalanuvchi"}`}
        subtitle="Live catalog"
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50"
              >
                <button className="block w-full text-left" onClick={() => void handleProductSelect(product.id)}>
                  <div className="aspect-[4/3] bg-[linear-gradient(135deg,_#fed7aa,_#e0f2fe)]">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                        Rasm mavjud emas
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-semibold text-slate-950">{product.name}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      {product.description || "Mahsulot tavsifi kiritilmagan."}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-950">
                        {formatPrice(product.price)}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(product.isActive === false ? "Inactive" : "Active")}`}>
                        {product.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="border-t border-slate-200 p-4">
                  <button
                    className="w-full rounded-[20px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    onClick={() => addToCart(product)}
                  >
                    Savatga qo'shish
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div>
            {selectedProduct ? (
              <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,_#0f172a,_#1d4ed8)] p-1">
                <div className="overflow-hidden rounded-[26px] bg-white">
                  <div className="aspect-[4/3] bg-slate-100">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-950">{selectedProduct.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {selectedProduct.description || "Tavsif mavjud emas."}
                        </p>
                      </div>
                      <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                        {formatPrice(selectedProduct.price)}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-500">
                      Yaratilgan vaqt: {formatDate(selectedProduct.createdAt)}
                    </div>
                    <button
                      className="mt-5 w-full rounded-[20px] bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                      onClick={() => addToCart(selectedProduct)}
                    >
                      Shu mahsulotni buyurtma qilish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="Mahsulot topilmadi" description="Tanlangan mahsulot yo'q." />
            )}
          </div>
        </div>
      </PageSection>

      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
