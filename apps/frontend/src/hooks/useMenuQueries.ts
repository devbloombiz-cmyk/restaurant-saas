import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  fetchInventory,
  fetchCategories,
  fetchItems,
  updateInventory,
  updateCategory,
  updateItem
} from "@/services/menuService";

export function useCategoriesQuery() {
  return useQuery({ queryKey: ["menu-categories"], queryFn: fetchCategories });
}

export function useItemsQuery() {
  return useQuery({ queryKey: ["menu-items"], queryFn: fetchItems });
}

export function useInventoryQuery() {
  return useQuery({ queryKey: ["menu-inventory"], queryFn: fetchInventory });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
    }
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; sortOrder?: number; isActive?: boolean } }) =>
      updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
    }
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
    }
  });
}

export function useCreateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useUpdateItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateItem>[1] }) => updateItem(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    }
  });
}

export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateInventory>[1] }) => updateInventory(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["menu-inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["menu-items"] })
      ]);
    }
  });
}
