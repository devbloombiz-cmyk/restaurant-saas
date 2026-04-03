import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types/api";

export type SystemHealth = {
  status: string;
  dbLatencyMs: number;
  uptimeSeconds: number;
  timestamp: string;
};

export type SystemMetrics = {
  dbLatencyMs: number;
  apiResponseTimeMs: number;
  memoryUsage: Record<string, number>;
  cpuUsage: {
    loadAverage: number[];
    cpuCount: number;
  };
  uptimeSeconds: number;
  activeSessions: number;
};

export type SystemDiagnostics = {
  health: SystemHealth;
  metrics: SystemMetrics;
  nodeEnv: string;
  pid: number;
};

export type BackupFile = {
  filename: string;
  sizeBytes: number;
  updatedAt: string;
};

export async function fetchSystemHealth(): Promise<SystemHealth> {
  const { data } = await apiClient.get<ApiResponse<SystemHealth>>("/system/health");
  return data.data;
}

export async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const { data } = await apiClient.get<ApiResponse<SystemMetrics>>("/system/metrics");
  return data.data;
}

export async function fetchSystemDiagnostics(): Promise<SystemDiagnostics> {
  const { data } = await apiClient.get<ApiResponse<SystemDiagnostics>>("/system/diagnostics");
  return data.data;
}

export async function createBackup(): Promise<{ fileName: string; fullPath: string }> {
  const { data } = await apiClient.post<ApiResponse<{ fileName: string; fullPath: string }>>("/system/backup", {});
  return data.data;
}

export async function restoreBackup(fileName: string): Promise<{ restoredFrom: string }> {
  const { data } = await apiClient.post<ApiResponse<{ restoredFrom: string }>>("/system/restore", { fileName });
  return data.data;
}

export async function fetchBackups(): Promise<BackupFile[]> {
  const { data } = await apiClient.get<ApiResponse<BackupFile[]>>("/system/backups");
  return data.data;
}

export async function downloadBackupFile(fileName: string): Promise<void> {
  const response = await apiClient.get(`/system/backups/${encodeURIComponent(fileName)}`, { responseType: "blob" });
  const blob = new Blob([response.data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
