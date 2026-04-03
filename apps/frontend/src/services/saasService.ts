import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { PlatformSummary, ShopSummary, TenantSummary } from "@/types/domain";

export async function fetchPlatformSummary(): Promise<PlatformSummary> {
  const { data } = await apiClient.get<ApiResponse<PlatformSummary>>("/saas/platform-summary");
  return data.data;
}

export async function fetchTenants(): Promise<TenantSummary[]> {
  const { data } = await apiClient.get<ApiResponse<TenantSummary[]>>("/saas/tenants");
  return data.data;
}

export async function fetchSaasShops(): Promise<ShopSummary[]> {
  const { data } = await apiClient.get<ApiResponse<ShopSummary[]>>("/saas/shops");
  return data.data;
}

export async function updateTenantStatus(id: string, isActive: boolean): Promise<TenantSummary> {
  const { data } = await apiClient.patch<ApiResponse<TenantSummary>>(`/saas/tenant-status/${id}`, { isActive });
  return data.data;
}

export async function updateShopStatus(id: string, isActive: boolean): Promise<ShopSummary> {
  const { data } = await apiClient.patch<ApiResponse<ShopSummary>>(`/saas/shop-status/${id}`, { isActive });
  return data.data;
}
