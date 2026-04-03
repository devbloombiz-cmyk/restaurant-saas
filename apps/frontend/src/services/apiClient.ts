import axios from "axios";
import { useAppStore } from "@/store/appStore";
import { useToastStore } from "@/store/toastStore";

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    return null;
  }

  refreshInFlight = (async () => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
      const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
      const accessToken = response.data?.data?.accessToken as string | undefined;
      const nextRefreshToken = response.data?.data?.refreshToken as string | undefined;

      if (!accessToken || !nextRefreshToken) {
        return null;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", nextRefreshToken);
      return accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const tenantId = localStorage.getItem("tenantId");
  const shopId = localStorage.getItem("shopId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers["x-tenant-id"] = tenantId;
  }

  if (shopId) {
    config.headers["x-shop-id"] = shopId;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as { headers?: Record<string, string>; _retry?: boolean } | undefined;
    const status = error?.response?.status as number | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const token = await refreshAccessToken();

      if (token) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      }

      useAppStore.getState().resetSession();
      localStorage.removeItem("refreshToken");
      useToastStore.getState().pushToast({ type: "error", message: "Session expired. Please login again." });
    }

    return Promise.reject(error);
  }
);
