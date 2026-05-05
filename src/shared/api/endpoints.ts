export const endpoints = {
  auth: {
    telegram: "/api/auth/telegram",
    me: "/api/user/me",
  },
  products: {
    list: "/api/app/products",
    byId: (id: string | number) => `/api/app/products/${id}`,
  },
  orders: {
    create: "/api/app/orders",
    my: "/api/app/orders/my",
  },
} as const;
