import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchShopSettings, updateShopSettings } from "@/services/settingsService";

export function useShopSettingsQuery() {
  return useQuery({ queryKey: ["shop-settings"], queryFn: fetchShopSettings });
}

export function useUpdateShopSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateShopSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-settings"] });
    }
  });
}
