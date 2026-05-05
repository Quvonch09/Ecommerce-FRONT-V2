import axios from "axios";
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

export async function fetchMeWithToken(token: string) {
  const response = await api.get<ApiResponse<User>>(endpoints.auth.me, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data;
}

export function getAuthErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
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
