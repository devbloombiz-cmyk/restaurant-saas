export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  SHOP_ADMIN: "shop_admin",
  CASHIER: "cashier"
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
