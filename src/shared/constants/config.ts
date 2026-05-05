export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "https://qdtu.uz";

export const STORAGE_KEYS = {
  token: "miniapp_token",
  cart: "miniapp_cart",
} as const;
