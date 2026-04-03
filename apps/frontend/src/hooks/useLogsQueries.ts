import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/services/logsService";

export function useLogsQuery() {
  return useQuery({ queryKey: ["logs"], queryFn: fetchLogs });
}
