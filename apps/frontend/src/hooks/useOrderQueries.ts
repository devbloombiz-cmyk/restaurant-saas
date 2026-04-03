import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, fetchDailySummary, fetchOrders } from "@/services/orderService";

export function useOrdersQuery() {
  return useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
}

export function useOrderDailySummaryQuery() {
  return useQuery({ queryKey: ["orders-daily-summary"], queryFn: fetchDailySummary });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
        queryClient.invalidateQueries({ queryKey: ["orders-daily-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["daily-report"] })
      ]);
    }
  });
}
