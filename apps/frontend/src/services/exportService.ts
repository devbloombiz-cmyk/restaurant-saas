import { apiClient } from "@/services/apiClient";

export async function downloadCsv(endpoint: "orders" | "reports" | "menu"): Promise<void> {
  const response = await apiClient.get(`/export/${endpoint}`, { responseType: "blob" });
  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${endpoint}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
