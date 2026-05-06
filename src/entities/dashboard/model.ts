import type { Stock } from "@/entities/stock/model";

export type TopProduct = {
  productId: number;
  productName: string;
  soldQuantity: number;
};

export type DashboardSummary = {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  totalProducts: number;
  revenue: number;
  estimatedCost: number;
  estimatedProfit: number;
  debtOutstanding: number;
  topProducts: TopProduct[];
  lowStockProducts: Stock[];
};
