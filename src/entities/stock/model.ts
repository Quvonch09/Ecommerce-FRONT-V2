export type Stock = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  minThreshold?: number;
  lowStock: boolean;
};
