import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/shared/constants/config";

type LogoutListener = () => void;

let logoutListener: LogoutListener | null = null;

export function bindUnauthorizedHandler(listener: LogoutListener) {
  logoutListener = listener;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.token);
      logoutListener?.();
    }

    return Promise.reject(error);
  },
);
