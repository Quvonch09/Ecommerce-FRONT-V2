import type { Order } from "@/entities/order/model";
import type { CartItem } from "@/features/cart/store";
import { api } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";

type ApiResponse<T> = {
  data: T;
};

export async function createOrder(items: CartItem[]) {
  const response = await api.post<ApiResponse<Order>>(endpoints.orders.create, {
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    })),
    createDebt: false,
  });

  return response.data.data;
}

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>(endpoints.orders.my);
  return response.data.data;
}
