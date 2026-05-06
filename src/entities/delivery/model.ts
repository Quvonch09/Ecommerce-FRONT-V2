export type DeliveryStatus = "PENDING" | "ON_THE_WAY" | "DELIVERED";

export type Delivery = {
  id: number;
  orderId: number;
  address: string;
  status: DeliveryStatus;
  createdAt: string;
};
