import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlatformSummary, fetchSaasShops, fetchTenants, updateShopStatus, updateTenantStatus } from "@/services/saasService";

export function usePlatformSummaryQuery() {
  return useQuery({ queryKey: ["platform-summary"], queryFn: fetchPlatformSummary });
}

export function useTenantsQuery() {
  return useQuery({ queryKey: ["saas-tenants"], queryFn: fetchTenants });
}

export function useSaasShopsQuery() {
  return useQuery({ queryKey: ["saas-shops"], queryFn: fetchSaasShops });
}

export function useUpdateTenantStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateTenantStatus(id, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["saas-tenants"] }),
        queryClient.invalidateQueries({ queryKey: ["platform-summary"] })
      ]);
    }
  });
}

export function useUpdateShopStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateShopStatus(id, isActive),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["saas-shops"] }),
        queryClient.invalidateQueries({ queryKey: ["platform-summary"] })
      ]);
    }
  });
}
