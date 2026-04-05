import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";
import type { DailyReport, ReportOverview } from "@/types/domain";

export async function fetchDailyReport(): Promise<DailyReport> {
  const { data } = await apiClient.get<ApiResponse<DailyReport>>("/reports/daily");
  return data.data;
}

export async function fetchReportOverview(payload: {
  from: string;
  to: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}): Promise<ReportOverview> {
  const { data } = await apiClient.get<ApiResponse<ReportOverview>>("/reports/overview", {
    params: payload
  });

  return data.data;
}
