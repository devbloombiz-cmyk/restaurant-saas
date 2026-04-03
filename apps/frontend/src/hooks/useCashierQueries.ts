import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCashier, deleteCashier, fetchCashiers, updateCashier } from "@/services/cashierService";

export function useCashiersQuery() {
  return useQuery({ queryKey: ["cashiers"], queryFn: fetchCashiers });
}

export function useCreateCashierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCashier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    }
  });
}

export function useUpdateCashierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; password: string; isActive: boolean }> }) =>
      updateCashier(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    }
  });
}

export function useDeleteCashierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCashier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    }
  });
}
