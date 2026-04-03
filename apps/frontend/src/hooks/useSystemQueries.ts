import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBackup,
  fetchBackups,
  fetchSystemDiagnostics,
  fetchSystemHealth,
  fetchSystemMetrics,
  restoreBackup
} from "@/services/systemService";

export function useSystemHealthQuery() {
  return useQuery({ queryKey: ["system-health"], queryFn: fetchSystemHealth, refetchInterval: 15_000 });
}

export function useSystemMetricsQuery() {
  return useQuery({ queryKey: ["system-metrics"], queryFn: fetchSystemMetrics, refetchInterval: 15_000 });
}

export function useSystemDiagnosticsQuery() {
  return useQuery({ queryKey: ["system-diagnostics"], queryFn: fetchSystemDiagnostics, refetchInterval: 20_000 });
}

export function useBackupsQuery() {
  return useQuery({ queryKey: ["system-backups"], queryFn: fetchBackups });
}

export function useCreateBackupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBackup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["system-backups"] });
    }
  });
}

export function useRestoreBackupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreBackup,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["system-backups"] }),
        queryClient.invalidateQueries({ queryKey: ["system-health"] }),
        queryClient.invalidateQueries({ queryKey: ["system-metrics"] }),
        queryClient.invalidateQueries({ queryKey: ["system-diagnostics"] })
      ]);
    }
  });
}
