import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { AuditLog } from "@/types/domain";

export async function fetchLogs(): Promise<AuditLog[]> {
  const { data } = await apiClient.get<ApiResponse<AuditLog[]>>("/logs");
  return data.data;
}
