import { queryClient } from "@/services/queryClient";

const SESSION_STORAGE_KEYS = [
  "accessToken",
  "refreshToken",
  "tenantId",
  "shopId",
  "currentRole",
  "currentUserName",
  "currentUserEmail",
  "permissions",
  "currency"
] as const;

export function clearClientSessionArtifacts(): void {
  queryClient.clear();

  SESSION_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}
