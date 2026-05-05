export type User = {
  id: number;
  telegramId: number;
  phoneNumber?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  role: "ROLE_ADMIN" | "ROLE_SELLER" | "ROLE_USER";
  createdAt: string;
};

export type TelegramProfile = {
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
};
