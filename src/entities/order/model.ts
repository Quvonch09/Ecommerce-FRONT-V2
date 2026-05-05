export type OrderItemPayload = {
  productId: number;
  quantity: number;
};

export type Order = {
  id: number;
  userId: number;
  totalAmount: number;
  status: "NEW" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
};
