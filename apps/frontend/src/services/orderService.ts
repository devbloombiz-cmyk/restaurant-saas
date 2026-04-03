import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { CreateOrderPayload } from "@/types/domain";

export async function createOrder(payload: CreateOrderPayload): Promise<{ orderNumber: string }> {
  const { data } = await apiClient.post<ApiResponse<{ orderNumber: string }>>("/orders", payload);
  return data.data;
}

export async function fetchOrders(): Promise<Array<Record<string, unknown>>> {
  const { data } = await apiClient.get<ApiResponse<Array<Record<string, unknown>>>>("/orders");
  return data.data;
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
