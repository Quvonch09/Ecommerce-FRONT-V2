import axios from "axios";
import type { DashboardSummary } from "@/entities/dashboard/model";
import type { Debt } from "@/entities/debt/model";
import type { Delivery, DeliveryStatus } from "@/entities/delivery/model";
import type { Order, OrderItemPayload, OrderStatus } from "@/entities/order/model";
import type { Payment } from "@/entities/payment/model";
import type { Product } from "@/entities/product/model";
import type { Stock } from "@/entities/stock/model";
import type { User } from "@/entities/user/model";
import { api } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiMessage, ApiResponse } from "@/shared/api/types";

export type ProductPayload = {
  name: string;
  description?: string;
  price: number;
  costPrice: number;
  imageUrl?: string;
  isActive?: boolean;
};

export type StockPayload = {
  quantity: number;
  minThreshold?: number;
};

export type CreateOrderPayload = {
  items: OrderItemPayload[];
  createDebt: boolean;
};

export type CreateDeliveryPayload = {
  orderId: number;
  address: string;
};

export type CreateDebtPayload = {
  userId: number;
  totalAmount: number;
};

export type CreatePaymentPayload = {
  debtId: number;
  amount: number;
};

export type CreateSellerPayload = {
  telegramId: number;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName?: string;
  username?: string;
};

function unwrap<T>(response: ApiResponse<T>) {
  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (error.response?.status) {
      return `HTTP ${error.response.status}`;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Noma'lum xatolik yuz berdi.";
}

export async function getProducts() {
  const response = await api.get<ApiResponse<Product[]>>(endpoints.app.products);
  return unwrap(response.data);
}

export async function getProductById(id: number) {
  const response = await api.get<ApiResponse<Product>>(endpoints.app.productById(id));
  return unwrap(response.data);
}

export async function createProduct(payload: ProductPayload) {
  const response = await api.post<ApiResponse<Product>>(endpoints.app.products, payload);
  return unwrap(response.data);
}

export async function updateProduct(id: number, payload: ProductPayload) {
  const response = await api.put<ApiResponse<Product>>(endpoints.app.productById(id), payload);
  return unwrap(response.data);
}

export async function deleteProduct(id: number) {
  const response = await api.delete<ApiResponse<ApiMessage>>(endpoints.app.productById(id));
  return unwrap(response.data);
}

export async function getStock() {
  const response = await api.get<ApiResponse<Stock[]>>(endpoints.app.stock);
  return unwrap(response.data);
}

export async function updateStock(productId: number, payload: StockPayload) {
  const response = await api.put<ApiResponse<Stock>>(endpoints.app.stockByProductId(productId), payload);
  return unwrap(response.data);
}

export async function createOrder(payload: CreateOrderPayload) {
  const response = await api.post<ApiResponse<Order>>(endpoints.app.orders, payload);
  return unwrap(response.data);
}

export async function getOrder(id: number) {
  const response = await api.get<ApiResponse<Order>>(endpoints.app.orderById(id));
  return unwrap(response.data);
}

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>(endpoints.app.myOrders);
  return unwrap(response.data);
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const response = await api.put<ApiResponse<Order>>(endpoints.app.orderStatus(id), { status });
  return unwrap(response.data);
}

export async function getMyDebts() {
  const response = await api.get<ApiResponse<Debt[]>>(endpoints.app.myDebts);
  return unwrap(response.data);
}

export async function createDebt(payload: CreateDebtPayload) {
  const response = await api.post<ApiResponse<Debt>>(endpoints.app.debts, payload);
  return unwrap(response.data);
}

export async function getPayments(debtId: number) {
  const response = await api.get<ApiResponse<Payment[]>>(endpoints.app.paymentsByDebtId(debtId));
  return unwrap(response.data);
}

export async function createPayment(payload: CreatePaymentPayload) {
  const response = await api.post<ApiResponse<Payment>>(endpoints.app.payments, payload);
  return unwrap(response.data);
}

export async function createDelivery(payload: CreateDeliveryPayload) {
  const response = await api.post<ApiResponse<Delivery>>(endpoints.app.deliveries, payload);
  return unwrap(response.data);
}

export async function updateDeliveryStatus(id: number, status: DeliveryStatus) {
  const response = await api.put<ApiResponse<Delivery>>(endpoints.app.deliveryStatus(id), { status });
  return unwrap(response.data);
}

export async function getDashboard() {
  const response = await api.get<ApiResponse<DashboardSummary>>(endpoints.admin.dashboard);
  return unwrap(response.data);
}

export async function getAllOrders() {
  const response = await api.get<ApiResponse<Order[]>>(endpoints.admin.orders);
  return unwrap(response.data);
}

export async function getAllUsers() {
  const response = await api.get<ApiResponse<User[]>>(endpoints.admin.users);
  return unwrap(response.data);
}

export async function getSellers() {
  const response = await api.get<ApiResponse<User[]>>(endpoints.admin.sellers);
  return unwrap(response.data);
}

export async function createSeller(payload: CreateSellerPayload) {
  const response = await api.post<ApiResponse<User>>(endpoints.admin.sellers, payload);
  return unwrap(response.data);
}

export async function sendOpenApp(userId: number) {
  const response = await api.post<ApiResponse<{ sent: boolean; telegramId: number; text: string }>>(
    endpoints.admin.openApp(userId),
  );
  return unwrap(response.data);
}

export async function sendDebtReminder(debtId: number) {
  const response = await api.post<ApiResponse<{ sent: boolean; telegramId: number; text: string }>>(
    endpoints.admin.debtReminder,
    { debtId },
  );
  return unwrap(response.data);
}
