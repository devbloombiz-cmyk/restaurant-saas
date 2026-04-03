import { useQuery } from "@tanstack/react-query";
import { fetchDailyReport } from "@/services/reportService";

export function useDailyReportQuery() {
  return useQuery({ queryKey: ["daily-report"], queryFn: fetchDailyReport });
}
