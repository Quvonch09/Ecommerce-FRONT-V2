import type { User } from "@/entities/user/model";
import { api } from "@/shared/api/axios";
import { endpoints } from "@/shared/api/endpoints";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  status: number;
  data: T;
  timestamp: string;
};

export async function telegramLogin(telegramId: string) {
  const response = await api.post<ApiResponse<{ token: string }>>(endpoints.auth.telegram, {
    telegramId,
  });

  return response.data.data.token;
}

export async function fetchMe() {
  const response = await api.get<ApiResponse<User>>(endpoints.auth.me);
  return response.data.data;
}
