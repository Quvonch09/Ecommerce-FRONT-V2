export type OrderItemPayload = {
  productId: number;
  quantity: number;
};

export type OrderStatus = "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};
