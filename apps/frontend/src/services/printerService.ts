import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { KotPayload, PrinterSettings } from "@/types/domain";

export async function printKot(orderId: string, copies?: number): Promise<KotPayload> {
  const { data } = await apiClient.post<ApiResponse<KotPayload>>(`/print/kot/${orderId}`, copies ? { copies } : {});
  return data.data;
}

export async function reprintLastOrder(): Promise<KotPayload> {
  const { data } = await apiClient.post<ApiResponse<KotPayload>>("/print/reprint-last", {});
  return data.data;
}

export async function fetchPrinterSettings(): Promise<PrinterSettings> {
  const { data } = await apiClient.get<ApiResponse<PrinterSettings>>("/print/settings");
  return data.data;
}

export async function updatePrinterSettings(payload: Partial<PrinterSettings>): Promise<PrinterSettings> {
  const { data } = await apiClient.patch<ApiResponse<PrinterSettings>>("/print/settings", payload);
  return data.data;
}
