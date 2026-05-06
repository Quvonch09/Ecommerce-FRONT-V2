import { useEffect, useState } from "react";
import type { Product } from "@/entities/product/model";
import {
  createProduct,
  deleteProduct,
  getApiErrorMessage,
  getProducts,
  updateProduct,
} from "@/features/app/api";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Loader } from "@/shared/ui/Loader";
import { PageSection } from "@/shared/ui/PageSection";
import { StatusNotice } from "@/shared/ui/StatusNotice";
import { formatPrice } from "@/shared/utils/currency";
import { tone } from "@/shared/utils/format";

const initialProduct = {
  name: "",
  description: "",
  price: "",
  costPrice: "",
  imageUrl: "",
  isActive: true,
};

export function AdminProductsPage() {
  const isAdmin = useAuthStore((state) => state.user?.role === "ROLE_ADMIN");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState(initialProduct);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setProducts(await getProducts());
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const beginProductEdit = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price ?? ""),
      costPrice: String(product.costPrice ?? ""),
      imageUrl: product.imageUrl ?? "",
      isActive: product.isActive ?? true,
    });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(initialProduct);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.price || !productForm.costPrice) {
      setErrorMessage("Mahsulot nomi, price va cost price majburiy.");
      return;
    }

    setBusy("product");
    setStatusMessage(null);
    setErrorMessage(null);

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      costPrice: Number(productForm.costPrice),
      imageUrl: productForm.imageUrl.trim(),
      isActive: productForm.isActive,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setStatusMessage(`Product #${editingProductId} yangilandi.`);
      } else {
        const product = await createProduct(payload);
        setStatusMessage(`Product #${product.id} yaratildi.`);
      }

      resetProductForm();
      await loadData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setBusy(`delete-${id}`);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      await deleteProduct(id);
      setStatusMessage(`Product #${id} o'chirildi.`);
      await loadData();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <PageSection title="Products" subtitle="Product CRUD API">
        {products.length ? (
          <div className="grid gap-4">
            {products.map((product) => (
              <article key={product.id} className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone(product.isActive === false ? "Inactive" : "Active")}`}>
                        {product.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      {formatPrice(product.price)} | Cost {formatPrice(product.costPrice ?? 0)}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{product.description}</div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="secondary" onClick={() => beginProductEdit(product)}>
                      Edit
                    </Button>
                    {isAdmin ? (
                      <Button variant="danger" disabled={busy === `delete-${product.id}`} onClick={() => void handleDeleteProduct(product.id)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Products yo'q" description="Backend products ro'yxati bo'sh." />
        )}
      </PageSection>

      <PageSection title={editingProductId ? "Edit product" : "Create product"} subtitle="POST / PUT product">
        <div className="grid gap-4">
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" />
          <textarea className="min-h-28 rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value.replace(/[^\d.]/g, "") }))} placeholder="Price" />
            <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={productForm.costPrice} onChange={(event) => setProductForm((current) => ({ ...current, costPrice: event.target.value.replace(/[^\d.]/g, "") }))} placeholder="Cost price" />
          </div>
          <input className="rounded-[18px] border border-slate-200 px-4 py-3 outline-none focus:border-sky-300" value={productForm.imageUrl} onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Image URL" />
          <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={productForm.isActive} onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))} />
            Active product
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={busy === "product"} onClick={() => void handleSaveProduct()}>
              {busy === "product" ? "Saqlanmoqda..." : editingProductId ? "Yangilash" : "Yaratish"}
            </Button>
            <Button variant="secondary" onClick={resetProductForm}>
              Tozalash
            </Button>
          </div>
        </div>
      </PageSection>

      {statusMessage ? <StatusNotice message={statusMessage} /> : null}
      {errorMessage ? <StatusNotice tone="error" message={errorMessage} /> : null}
    </div>
  );
}
