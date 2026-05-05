import type { Product } from "@/entities/product/model";
import { api } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";

type ApiResponse<T> = {
  data: T;
};

export async function getProducts() {
  const response = await api.get<ApiResponse<Product[]>>(endpoints.products.list);
  return response.data.data;
}

export async function getProductById(productId: string) {
  const response = await api.get<ApiResponse<Product>>(endpoints.products.byId(productId));
  return response.data.data;
}
