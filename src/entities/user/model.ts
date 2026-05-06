export type UserRole = "ROLE_ADMIN" | "ROLE_SELLER" | "ROLE_USER";

export type User = {
  id: number;
  telegramId: number;
  phoneNumber?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  role: UserRole;
  createdAt: string;
};

export type TelegramProfile = {
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
};
