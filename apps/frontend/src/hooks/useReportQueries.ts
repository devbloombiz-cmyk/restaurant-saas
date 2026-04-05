import { useQuery } from "@tanstack/react-query";
import { fetchDailyReport, fetchReportOverview } from "@/services/reportService";

export function useDailyReportQuery() {
  return useQuery({ queryKey: ["daily-report"], queryFn: fetchDailyReport });
}

export function useReportOverviewQuery(payload: {
  from: string;
  to: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["report-overview", payload],
    queryFn: () => fetchReportOverview(payload)
  });
}
