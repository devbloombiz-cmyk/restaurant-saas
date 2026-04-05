import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderPayload } from "@/types/domain";

export async function createOrder(payload: CreateOrderPayload): Promise<{ orderNumber: string; orderId: string }> {
  const { data } = await apiClient.post<ApiResponse<Record<string, unknown>>>("/orders", payload);
  const order = data.data;

  return {
    orderNumber: String(order.orderNumber ?? ""),
    orderId: String(order._id ?? order.id ?? "")
  };
}

export async function fetchOrders(): Promise<Array<Record<string, unknown>>> {
  const { data } = await apiClient.get<
    ApiResponse<
      | Array<Record<string, unknown>>
      | {
          items?: Array<Record<string, unknown>>;
        }
    >
  >("/orders");

  const payload = data.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

export async function fetchDailySummary(): Promise<{
  totalOrders: number;
  totalSales: number;
  cashTotal: number;
  cardTotal: number;
  pendingTotal: number;
}> {
  const { data } = await apiClient.get<ApiResponse<{
    totalOrders: number;
    totalSales: number;
    cashTotal: number;
    cardTotal: number;
    pendingTotal: number;
  }>>("/orders/daily-summary");
  return data.data;
}
