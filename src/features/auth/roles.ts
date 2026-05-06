import type { UserRole } from "@/entities/user/model";

export function isManagerRole(role?: UserRole | null) {
  return role === "ROLE_ADMIN" || role === "ROLE_SELLER";
}

export function homePathByRole(role?: UserRole | null) {
  return isManagerRole(role) ? "/admin" : "/app";
}
