import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { UserRole } from "@shared/types/roles";
import axios from "axios";

export type LoginPayload = {
  email: string;
  password: string;
  tenantId: string;
  shopId?: string;
};

export type AuthUser = {
  userId: string;
  tenantId: string;
  shopId: string;
  name: string;
  email: string;
  role: UserRole;
};

export type SessionDetails = {
  user: AuthUser & { isActive: boolean };
  tenant: {
    tenantId: string;
    name: string;
    slug: string;
    isActive: boolean;
  } | null;
  activeShop: {
    shopId: string;
    name: string;
    location: string;
    isActive: boolean;
    currency: string;
  } | null;
  accessibleShops: Array<{
    shopId: string;
    name: string;
    location: string;
    isActive: boolean;
  }>;
  permissions: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  session?: SessionDetails;
};

export async function loginWithCredentials(payload: { email: string; password: string }): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login-credentials", payload);
  return data.data;
}

export async function loginLegacy(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return data.data;
}

export async function login(payload: { email: string; password: string }): Promise<LoginResponse> {
  try {
    return await loginWithCredentials(payload);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const fallbackTenantId = localStorage.getItem("tenantId") ?? "platform";
      const fallbackShopId = localStorage.getItem("shopId") ?? "platform";

      // Compatibility fallback for environments where the new endpoint is not deployed yet.
      return loginLegacy({
        email: payload.email,
        password: payload.password,
        tenantId: fallbackTenantId,
        shopId: fallbackShopId
      });
    }

    throw error;
  }
}

export async function getSession(): Promise<SessionDetails> {
  const { data } = await apiClient.get<ApiResponse<SessionDetails>>("/auth/session");
  return data.data;
}

export async function logout(payload: { accessToken: string; refreshToken: string }): Promise<void> {
  await apiClient.post("/auth/logout", payload);
}

export async function registerShopAdmin(payload: {
  tenantName: string;
  tenantSlug: string;
  shopName: string;
  shopLocation: string;
  currency: "INR" | "GBP" | "USD" | "EUR";
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}): Promise<{
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  shopId: string;
  shopName: string;
  currency: "INR" | "GBP" | "USD" | "EUR";
  adminUserId: string;
  adminEmail: string;
  role: UserRole;
}> {
  const { data } = await apiClient.post<
    ApiResponse<{
      tenantId: string;
      tenantName: string;
      tenantSlug: string;
      shopId: string;
      shopName: string;
      currency: "INR" | "GBP" | "USD" | "EUR";
      adminUserId: string;
      adminEmail: string;
      role: UserRole;
    }>
  >("/auth/register-shop-admin", payload);

  return data.data;
}
