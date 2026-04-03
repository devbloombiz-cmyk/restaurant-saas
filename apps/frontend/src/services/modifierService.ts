import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { Modifier } from "@/types/domain";

export async function fetchModifiers(): Promise<Modifier[]> {
  const { data } = await apiClient.get<ApiResponse<Modifier[]>>("/modifiers");
  return data.data;
}

export async function createModifier(payload: {
  itemId: string;
  name: string;
  priceAdjustment: number;
  type: "add" | "remove";
}): Promise<Modifier> {
  const { data } = await apiClient.post<ApiResponse<Modifier>>("/modifiers", payload);
  return data.data;
}

export async function updateModifier(id: string, payload: Partial<{ itemId: string; name: string; priceAdjustment: number; type: "add" | "remove" }>): Promise<Modifier> {
  const { data } = await apiClient.patch<ApiResponse<Modifier>>(`/modifiers/${id}`, payload);
  return data.data;
}

export async function deleteModifier(id: string): Promise<void> {
  await apiClient.delete(`/modifiers/${id}`);
}
