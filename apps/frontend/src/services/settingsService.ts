import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { ShopSettings } from "@/types/domain";

export async function fetchShopSettings(): Promise<ShopSettings> {
  const { data } = await apiClient.get<ApiResponse<ShopSettings>>("/settings/shop");
  localStorage.setItem("currency", data.data.currency ?? "INR");
  return data.data;
}

export async function updateShopSettings(payload: Partial<ShopSettings>): Promise<ShopSettings> {
  const { data } = await apiClient.patch<ApiResponse<ShopSettings>>("/settings/shop", payload);
  localStorage.setItem("currency", data.data.currency ?? "INR");
  return data.data;
}
