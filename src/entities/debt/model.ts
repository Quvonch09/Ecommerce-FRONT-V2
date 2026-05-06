export type DebtStatus = "OPEN" | "CLOSED";

export type Debt = {
  id: number;
  userId: number;
  totalAmount: number;
  paidAmount: number;
  status: DebtStatus;
  createdAt: string;
};
