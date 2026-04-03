import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { MenuCategory, MenuItem } from "@/types/domain";

export async function fetchCategories(): Promise<MenuCategory[]> {
  const { data } = await apiClient.get<ApiResponse<MenuCategory[]>>("/menu/categories");
  return data.data;
}

export async function createCategory(payload: { name: string; sortOrder?: number; isActive?: boolean }): Promise<MenuCategory> {
  const { data } = await apiClient.post<ApiResponse<MenuCategory>>("/menu/categories", payload);
  return data.data;
}

export async function updateCategory(id: string, payload: Partial<{ name: string; sortOrder: number; isActive: boolean }>): Promise<MenuCategory> {
  const { data } = await apiClient.patch<ApiResponse<MenuCategory>>(`/menu/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/menu/categories/${id}`);
}

export async function fetchItems(): Promise<MenuItem[]> {
  const { data } = await apiClient.get<ApiResponse<MenuItem[]>>("/menu/items");
  return data.data;
}

export async function createItem(payload: {
  categoryId: string;
  name: string;
  price: number;
  description?: string;
  modifierEnabled?: boolean;
  isAvailable?: boolean;
  image?: string;
  sortOrder?: number;
}): Promise<MenuItem> {
  const { data } = await apiClient.post<ApiResponse<MenuItem>>("/menu/items", payload);
  return data.data;
}

export async function updateItem(
  id: string,
  payload: Partial<{
    categoryId: string;
    name: string;
    price: number;
    description: string;
    modifierEnabled: boolean;
    isAvailable: boolean;
    image: string;
    sortOrder: number;
  }>
): Promise<MenuItem> {
  const { data } = await apiClient.patch<ApiResponse<MenuItem>>(`/menu/items/${id}`, payload);
  return data.data;
}

export async function deleteItem(id: string): Promise<void> {
  await apiClient.delete(`/menu/items/${id}`);
}
