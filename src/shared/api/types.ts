export type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  data: T;
  timestamp: string;
};

export type ApiMessage = {
  message: string;
};
