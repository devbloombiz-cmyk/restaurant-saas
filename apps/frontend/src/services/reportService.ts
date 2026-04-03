import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { DailyReport } from "@/types/domain";

export async function fetchDailyReport(): Promise<DailyReport> {
  const { data } = await apiClient.get<ApiResponse<DailyReport>>("/reports/daily");
  return data.data;
}
