import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Cashier } from "@/types/domain";

export async function fetchCashiers(): Promise<Cashier[]> {
  const { data } = await apiClient.get<ApiResponse<Cashier[]>>("/users/cashier");
  return data.data;
}

export async function createCashier(payload: { name: string; email: string; password: string }): Promise<Cashier> {
  const { data } = await apiClient.post<ApiResponse<Cashier>>("/users/cashier", payload);
  return data.data;
}

export async function updateCashier(
  id: string,
  payload: Partial<{ name: string; password: string; isActive: boolean }>
): Promise<Cashier> {
  const { data } = await apiClient.patch<ApiResponse<Cashier>>(`/users/cashier/${id}`, payload);
  return data.data;
}

export async function deleteCashier(id: string): Promise<void> {
  await apiClient.delete(`/users/cashier/${id}`);
}
