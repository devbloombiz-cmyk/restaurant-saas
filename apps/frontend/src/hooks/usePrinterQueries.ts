import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPrinterSettings, printKot, reprintLastOrder, updatePrinterSettings } from "@/services/printerService";

export function usePrinterSettingsQuery() {
  return useQuery({ queryKey: ["printer-settings"], queryFn: fetchPrinterSettings });
}

export function useUpdatePrinterSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrinterSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["printer-settings"] });
    }
  });
}

export function usePrintKotMutation() {
  return useMutation({
    mutationFn: ({ orderId, copies }: { orderId: string; copies?: number }) => printKot(orderId, copies)
  });
}

export function useReprintLastMutation() {
  return useMutation({
    mutationFn: reprintLastOrder
  });
}
